<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    protected $storeId;
    protected $storePassword;
    protected $sandbox;
    protected $apiUrl;

    public function __construct()
    {
        $this->storeId = config('sslcommerz.store_id');
        $this->storePassword = config('sslcommerz.store_password');
        $this->sandbox = config('sslcommerz.sandbox', true);
        $this->apiUrl = $this->sandbox 
            ? 'https://sandbox.sslcommerz.com' 
            : 'https://securepay.sslcommerz.com';
            
        // Log configuration for debugging
        Log::info('SSLCommerz configuration:', [
            'store_id' => $this->storeId,
            'store_password_length' => strlen($this->storePassword),
            'sandbox' => $this->sandbox,
            'api_url' => $this->apiUrl
        ]);
    }

    public function initiatePayment(Order $order)
    {
        try {
            Log::info('Initiating SSLCommerz payment for order:', ['order_id' => $order->id]);
            
            $postData = [
                // Store credentials
                'store_id' => $this->storeId,
                'store_passwd' => $this->storePassword,
                
                // Order information
                'total_amount' => $order->total,
                'currency' => $order->currency ?? 'BDT',
                'tran_id' => $order->order_number,
                
                // Customer information
                'cus_name' => $order->shipping_address['name'] ?? '',
                'cus_email' => $order->user->email,
                'cus_add1' => $order->shipping_address['address'] ?? '',
                'cus_add2' => $order->shipping_address['address2'] ?? '',
                'cus_city' => $order->shipping_address['city'] ?? '',
                'cus_state' => $order->shipping_address['state'] ?? '',
                'cus_postcode' => $order->shipping_address['postal_code'] ?? '',
                'cus_country' => 'Bangladesh',
                'cus_phone' => $order->shipping_address['phone'] ?? '',
                'cus_fax' => '',
                
                // Shipping information
                'ship_name' => $order->shipping_address['name'] ?? '',
                'ship_add1' => $order->shipping_address['address'] ?? '',
                'ship_add2' => $order->shipping_address['address2'] ?? '',
                'ship_city' => $order->shipping_address['city'] ?? '',
                'ship_state' => $order->shipping_address['state'] ?? '',
                'ship_postcode' => $order->shipping_address['postal_code'] ?? '',
                'ship_country' => 'Bangladesh',
                
                // Product information
                'product_name' => 'Order #' . $order->order_number,
                'product_category' => 'General',
                'product_profile' => 'general',
                
                // Additional parameters
                'shipping_method' => 'NO',
                'num_of_item' => count($order->items),
                'cart' => json_encode($order->items->toArray()),
                
                // URLs
                'success_url' => route('payment.success'),
                'fail_url' => route('payment.fail'),
                'cancel_url' => route('payment.cancel'),
                'ipn_url' => route('payment.ipn'),
                
                // Additional options
                'value_a' => $order->id,
                'value_b' => $order->user_id,
            ];

            // Log the data being sent
            Log::info('Sending data to SSLCommerz:', [
                'order_id' => $order->id,
                'post_data_keys' => array_keys($postData),
                'total_amount' => $postData['total_amount'],
                'tran_id' => $postData['tran_id']
            ]);

            // Send request to SSLCommerz
            $response = Http::asForm()->post($this->apiUrl . '/gwprocess/v4/api.php', $postData);
            
            Log::info('SSLCommerz response received:', [
                'order_id' => $order->id,
                'status' => $response->status(),
                'successful' => $response->successful()
            ]);
            
            if ($response->successful()) {
                $result = $response->json();
                Log::info('SSLCommerz response data:', [
                    'order_id' => $order->id,
                    'result_keys' => array_keys($result)
                ]);
                
                if (isset($result['status']) && $result['status'] === 'SUCCESS') {
                    return [
                        'success' => true,
                        'payment_url' => $result['GatewayPageURL'] ?? null,
                        'redirect_url' => $result['redirectURL'] ?? null,
                        'session_key' => $result['sessionkey'] ?? null,
                    ];
                } else {
                    Log::error('SSLCommerz payment initiation failed', [
                        'order_id' => $order->id,
                        'response' => $result
                    ]);
                    
                    return [
                        'success' => false,
                        'message' => $result['failedreason'] ?? 'Payment initiation failed'
                    ];
                }
            } else {
                Log::error('SSLCommerz API request failed', [
                    'order_id' => $order->id,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                
                return [
                    'success' => false,
                    'message' => 'Payment gateway is temporarily unavailable'
                ];
            }
        } catch (\Exception $e) {
            Log::error('SSLCommerz payment initiation exception', [
                'order_id' => $order->id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'message' => 'An error occurred while initiating payment: ' . $e->getMessage()
            ];
        }
    }

    public function validateTransaction($transactionId, $sessionKey)
    {
        try {
            $params = [
                'store_id' => $this->storeId,
                'store_passwd' => $this->storePassword,
                'tran_id' => $transactionId,
                'val_id' => $sessionKey,
            ];

            $response = Http::asForm()->get($this->apiUrl . '/validator/api/validationserverAPI.php', $params);
            
            if ($response->successful()) {
                $result = $response->json();
                
                if (isset($result['status']) && $result['status'] === 'VALID') {
                    return [
                        'valid' => true,
                        'data' => $result
                    ];
                } elseif (isset($result['status']) && $result['status'] === 'VALIDATED') {
                    return [
                        'valid' => true,
                        'data' => $result
                    ];
                } else {
                    return [
                        'valid' => false,
                        'message' => $result['failedreason'] ?? 'Transaction validation failed'
                    ];
                }
            } else {
                Log::error('SSLCommerz validation API request failed', [
                    'transaction_id' => $transactionId,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                
                return [
                    'valid' => false,
                    'message' => 'Unable to validate transaction'
                ];
            }
        } catch (\Exception $e) {
            Log::error('SSLCommerz transaction validation exception', [
                'transaction_id' => $transactionId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'valid' => false,
                'message' => 'An error occurred while validating transaction'
            ];
        }
    }
}