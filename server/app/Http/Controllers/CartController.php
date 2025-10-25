<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductAttribute;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index()
    {
        try {
            $cartItems = Cart::where('user_id', auth()->id())
                ->with(['product', 'attribute'])
                ->get();

            $subtotal = $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            return response()->json([
                'items' => $cartItems,
                'subtotal' => $subtotal,
                'count' => $cartItems->sum('quantity'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch cart',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
                'attribute_id' => 'nullable|exists:product_attributes,id',
            ]);

            $product = Product::findOrFail($request->product_id);
            
            // Check if product is active and in stock
            if ($product->status !== 'active') {
                return response()->json(['message' => 'Product is not available'], 400);
            }

            if ($product->quantity < $request->quantity) {
                return response()->json(['message' => 'Insufficient stock'], 400);
            }

            // Check if item already exists in cart
            $existingItem = Cart::where('user_id', auth()->id())
                ->where('product_id', $request->product_id)
                ->where('attribute_id', $request->attribute_id)
                ->first();

            if ($existingItem) {
                $newQuantity = $existingItem->quantity + $request->quantity;
                
                if ($product->quantity < $newQuantity) {
                    return response()->json(['message' => 'Insufficient stock'], 400);
                }

                $existingItem->update(['quantity' => $newQuantity]);
                $cartItem = $existingItem;
            } else {
                $price = $product->price;
                
                // Add attribute price if applicable
                if ($request->attribute_id) {
                    $attribute = ProductAttribute::find($request->attribute_id);
                    if ($attribute) {
                        $price += $attribute->additional_price;
                    }
                }

                $cartItem = Cart::create([
                    'user_id' => auth()->id(),
                    'product_id' => $request->product_id,
                    'attribute_id' => $request->attribute_id,
                    'quantity' => $request->quantity,
                    'price' => $price,
                ]);
            }

            return response()->json([
                'message' => 'Item added to cart successfully',
                'item' => $cartItem->load(['product', 'attribute'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to add item to cart',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'quantity' => 'required|integer|min:1',
            ]);

            $cartItem = Cart::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $product = $cartItem->product;
            
            if ($product->quantity < $request->quantity) {
                return response()->json(['message' => 'Insufficient stock'], 400);
            }

            $cartItem->update(['quantity' => $request->quantity]);

            return response()->json([
                'message' => 'Cart item updated successfully',
                'item' => $cartItem->load(['product', 'attribute'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update cart item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $cartItem = Cart::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $cartItem->delete();

            return response()->json(['message' => 'Item removed from cart successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to remove cart item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function clear()
    {
        try {
            Cart::where('user_id', auth()->id())->delete();

            return response()->json(['message' => 'Cart cleared successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to clear cart',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}