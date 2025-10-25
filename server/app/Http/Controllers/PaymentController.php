<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Cart;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function initiate(Request $request)
    {
        try {
            // Log the incoming request data for debugging
            \Log::info('Payment initiation request data:', $request->all());
            
            // Check if user is authenticated
            if (!auth()->check()) {
                \Log::error('User not authenticated for payment initiation');
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            \Log::info('Authenticated user ID:', ['user_id' => auth()->id()]);
            
            // Validate request data with more specific rules
            $validator = \Validator::make($request->all(), [
                'shipping_address' => 'required|array',
                'shipping_address.name' => 'required|string|max:255',
                'shipping_address.phone' => 'required|string|max:20',
                'shipping_address.address' => 'required|string|max:500',
                'shipping_address.city' => 'required|string|max:100',
                'shipping_address.postal_code' => 'required|string|max:20',
                'billing_address' => 'required|array',
                'billing_address.name' => 'required|string|max:255',
                'billing_address.phone' => 'required|string|max:20',
                'billing_address.address' => 'required|string|max:500',
                'billing_address.city' => 'required|string|max:100',
                'billing_address.postal_code' => 'required|string|max:20',
                'payment_method' => 'required|string|in:sslcommerz,cod',
                'notes' => 'nullable|string|max:1000',
            ]);
            
            if ($validator->fails()) {
                \Log::error('Payment initiation validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Get user's cart items
            $cartItems = Cart::where('user_id', auth()->id())->with('product')->get();
            
            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your cart is empty'
                ], 400);
            }

            // Calculate totals
            $subtotal = $cartItems->sum(fn($item) => $item->price * $item->quantity);
            $tax = $subtotal * 0.05; // 5% tax
            $shipping = 60; // Flat shipping rate
            $total = $subtotal + $tax + $shipping;

            // Create order
            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shipping,
                'total' => $total,
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'currency' => 'BDT',
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address,
                'notes' => $request->notes,
            ]);

            // Create order items
            foreach ($cartItems as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->price * $item->quantity,
                ]);
            }

            // Process payment based on method
            if ($request->payment_method === 'cod') {
                // Cash on Delivery - no payment processing needed
                return response()->json([
                    'success' => true,
                    'payment_url' => config('app.frontend_url') . '/payment/success?order=' . $order->id,
                    'order_id' => $order->id,
                    'message' => 'Order placed successfully'
                ]);
            } else {
                // Online Payment - initiate SSLCommerz
                $result = $this->paymentService->initiatePayment($order);
                
                if ($result['success']) {
                    return response()->json([
                        'success' => true,
                        'payment_url' => $result['payment_url'],
                        'order_id' => $order->id,
                        'message' => 'Payment initiated successfully'
                    ]);
                } else {
                    // Delete the order if payment initiation fails
                    $order->delete();
                    
                    return response()->json([
                        'success' => false,
                        'message' => $result['message'] ?? 'Failed to initiate payment'
                    ], 400);
                }
            }
        } catch (\Exception $e) {
            \Log::error('Payment initiation exception:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function success(Request $request)
    {
        try {
            // For SSLCommerz success callback, we need to validate the transaction
            $transactionId = $request->get('tran_id');
            $sessionKey = $request->get('val_id');
            
            if ($transactionId && $sessionKey) {
                // Validate transaction with SSLCommerz
                $validation = $this->paymentService->validateTransaction($transactionId, $sessionKey);
                
                if ($validation['valid']) {
                    $order = Order::where('order_number', $transactionId)->first();
                    
                    if ($order) {
                        $order->update([
                            'payment_status' => 'paid',
                            'order_status' => 'processing',
                            'transaction_id' => $transactionId,
                        ]);

                        // Clear user's cart
                        Cart::where('user_id', $order->user_id)->delete();
                        
                        // Redirect to frontend success page
                        return redirect(config('app.frontend_url') . '/payment/success?order=' . $order->id);
                    }
                }
            }

            // If we're here, it might be a direct access or validation failed
            // We'll still show success page but log the issue
            $orderId = $request->get('order');
            return redirect(config('app.frontend_url') . '/payment/success?order=' . $orderId);
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url') . '/payment/fail?error=validation_failed');
        }
    }

    public function fail(Request $request)
    {
        try {
            $transactionId = $request->get('tran_id');
            
            if ($transactionId) {
                $order = Order::where('order_number', $transactionId)->first();
                if ($order) {
                    $order->update([
                        'payment_status' => 'failed',
                        'order_status' => 'cancelled',
                    ]);
                }
            }

            return redirect(config('app.frontend_url') . '/payment/fail?order=' . $transactionId);
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url') . '/payment/fail?error=processing_failed');
        }
    }

    public function cancel(Request $request)
    {
        try {
            $transactionId = $request->get('tran_id');
            
            if ($transactionId) {
                $order = Order::where('order_number', $transactionId)->first();
                if ($order) {
                    $order->update([
                        'payment_status' => 'cancelled',
                        'order_status' => 'cancelled',
                    ]);
                }
            }

            return redirect(config('app.frontend_url') . '/payment/cancel?order=' . $transactionId);
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url') . '/payment/cancel?error=processing_failed');
        }
    }

    public function ipn(Request $request)
    {
        try {
            // Handle Instant Payment Notification from SSLCommerz
            $transactionId = $request->get('tran_id');
            $sessionKey = $request->get('val_id');
            $status = $request->get('status');
            
            if ($transactionId && $sessionKey && $status) {
                // Validate transaction with SSLCommerz
                $validation = $this->paymentService->validateTransaction($transactionId, $sessionKey);
                
                if ($validation['valid']) {
                    $order = Order::where('order_number', $transactionId)->first();
                    
                    if ($order) {
                        switch ($status) {
                            case 'VALID':
                                $order->update([
                                    'payment_status' => 'paid',
                                    'order_status' => 'processing',
                                    'transaction_id' => $transactionId,
                                ]);
                                break;
                            case 'FAILED':
                                $order->update([
                                    'payment_status' => 'failed',
                                    'order_status' => 'cancelled',
                                ]);
                                break;
                            case 'CANCELLED':
                                $order->update([
                                    'payment_status' => 'cancelled',
                                    'order_status' => 'cancelled',
                                ]);
                                break;
                        }
                    }
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'IPN processed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'IPN processing failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}