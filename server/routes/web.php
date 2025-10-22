<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::match(['get', 'options'], '/csrf-token', function () {
    $response = response()->json(['token' => csrf_token()]);
    
    // Add CORS headers
    $response->header('Access-Control-Allow-Origin', 'http://localhost:5173');
    $response->header('Access-Control-Allow-Credentials', 'true');
    $response->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    $response->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Accept, Authorization');
    $response->header('Access-Control-Max-Age', '86400');
    
    return $response;
});