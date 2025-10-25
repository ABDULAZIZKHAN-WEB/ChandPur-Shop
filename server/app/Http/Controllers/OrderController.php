<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Order::where('user_id', auth()->id())
                ->with(['items.product'])
                ->orderBy('created_at', 'desc');

            // Filter by status if provided
            if ($request->filled('status')) {
                $query->where('order_status', $request->status);
            }

            $orders = $query->paginate($request->get('per_page', 10));

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch orders',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::where('user_id', auth()->id())
                ->where('id', $id)
                ->with(['items.product', 'items.attribute'])
                ->firstOrFail();

            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Order not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'shipping_address' => 'required|array',
                'shipping_address.name' => 'required|string|max:255',
                'shipping_address.phone' => 'required|string|max:20',
                'shipping_address.address' => 'required|string|max:500',
                'shipping_address.city' => 'required|string|max:100',
                'shipping_address.postal_code' => 'required|string|max:20',
                'billing_address' => 'required|array',
                'payment_method' => 'required|string|in:sslcommerz,cod',
                'notes' => 'nullable|string|max:1000',
            ]);

            // Get cart items
            $cartItems = Cart::where('user_id', auth()->id())
                ->with('product')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json(['message' => 'Cart is empty'], 400);
            }

            // Validate stock availability
            foreach ($cartItems as $item) {
                if ($item->product->quantity < $item->quantity) {
                    return response()->json([
                        'message' => "Insufficient stock for {$item->product->name}"
                    ], 400);
                }
            }

            // Calculate totals
            $subtotal = $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            $tax = $subtotal * 0.1; // 10% tax
            $shippingCost = $request->payment_method === 'cod' ? 100 : 50; // Higher for COD
            $discount = 0; // TODO: Apply coupon discount if provided
            $total = $subtotal + $tax + $shippingCost - $discount;

            // Create order
            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => 'ORD-' . time() . '-' . auth()->id(),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cod' ? 'pending' : 'pending',
                'order_status' => 'pending',
                'currency' => 'BDT',
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address,
                'notes' => $request->notes,
            ]);

            // Create order items and update product quantities
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'attribute_id' => $item->attribute_id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->price * $item->quantity,
                ]);

                // Update product quantity
                $item->product->decrement('quantity', $item->quantity);
            }

            // Clear cart
            Cart::where('user_id', auth()->id())->delete();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load(['items.product'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create order',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}