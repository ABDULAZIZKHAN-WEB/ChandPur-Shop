<?php

return [
    'store_id' => env('SSLCZ_STORE_ID', ''),
    'store_password' => env('SSLCZ_STORE_PASSWORD', ''),
    'sandbox' => env('SSLCZ_SANDBOX', true),
    
    // SSLCommerz callback URLs
    'success_url' => '/payment/success',
    'fail_url' => '/payment/fail',
    'cancel_url' => '/payment/cancel',
    'ipn_url' => '/payment/ipn',
];