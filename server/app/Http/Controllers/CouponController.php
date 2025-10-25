<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Cart;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CouponController extends Controller
{
    public function validate(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string',
                'subtotal' => 'required|numeric|min:0',
            ]);

            $coupon = Coupon::where('code', $request->code)
                ->where('status', 'active')
                ->first();

            if (!$coupon) {
                return response()->json(['message' => 'Invalid coupon code'], 400);
            }

            // Check if coupon is expired
            if ($coupon->end_date && Carbon::parse($coupon->end_date)->isPast()) {
                return response()->json(['message' => 'Coupon has expired'], 400);
            }

            // Check if coupon has not started yet
            if ($coupon->start_date && Carbon::parse($coupon->start_date)->isFuture()) {
                return response()->json(['message' => 'Coupon is not yet active'], 400);
            }

            // Check usage limit
            if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
                return response()->json(['message' => 'Coupon usage limit exceeded'], 400);
            }

            // Check minimum order value
            if ($coupon->min_order_value && $request->subtotal < $coupon->min_order_value) {
                return response()->json([
                    'message' => "Minimum order value of {$coupon->min_order_value} required"
                ], 400);
            }

            // Calculate discount
            $discount = 0;
            if ($coupon->type === 'percentage') {
                $discount = ($request->subtotal * $coupon->value) / 100;
                
                // Apply max discount limit if set
                if ($coupon->max_discount && $discount > $coupon->max_discount) {
                    $discount = $coupon->max_discount;
                }
            } else {
                $discount = $coupon->value;
            }

            // Ensure discount doesn't exceed subtotal
            $discount = min($discount, $request->subtotal);

            return response()->json([
                'valid' => true,
                'coupon' => [
                    'id' => $coupon->id,
                    'code' => $coupon->code,
                    'type' => $coupon->type,
                    'value' => $coupon->value,
                    'discount_amount' => $discount,
                ],
                'message' => 'Coupon applied successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to validate coupon',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}