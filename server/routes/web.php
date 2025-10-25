<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Payment callback routes (these need to be web routes, not API routes)
Route::post('/payment/success', [App\Http\Controllers\PaymentController::class, 'success'])->name('payment.success');
Route::post('/payment/fail', [App\Http\Controllers\PaymentController::class, 'fail'])->name('payment.fail');
Route::post('/payment/cancel', [App\Http\Controllers\PaymentController::class, 'cancel'])->name('payment.cancel');
Route::post('/payment/ipn', [App\Http\Controllers\PaymentController::class, 'ipn'])->name('payment.ipn');