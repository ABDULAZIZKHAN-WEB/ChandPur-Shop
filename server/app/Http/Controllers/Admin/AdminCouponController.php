<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Coupon::query();

            if ($request->filled('search')) {
                $query->where('code', 'like', '%' . $request->search . '%');
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $coupons = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json($coupons);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch coupons',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string|unique:coupons,code|max:50',
                'type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:0',
                'min_order_value' => 'nullable|numeric|min:0',
                'max_discount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                'status' => 'required|in:active,inactive',
            ]);

            $coupon = Coupon::create($request->all());

            return response()->json([
                'message' => 'Coupon created successfully',
                'coupon' => $coupon
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create coupon',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $coupon = Coupon::findOrFail($id);
            return response()->json($coupon);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Coupon not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $coupon = Coupon::findOrFail($id);

            $request->validate([
                'code' => 'required|string|max:50|unique:coupons,code,' . $id,
                'type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:0',
                'min_order_value' => 'nullable|numeric|min:0',
                'max_discount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                'status' => 'required|in:active,inactive',
            ]);

            $coupon->update($request->all());

            return response()->json([
                'message' => 'Coupon updated successfully',
                'coupon' => $coupon
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update coupon',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $coupon = Coupon::findOrFail($id);
            $coupon->delete();

            return response()->json(['message' => 'Coupon deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete coupon',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function usage($id)
    {
        try {
            $coupon = Coupon::findOrFail($id);
            
            // TODO: Get actual usage statistics from orders
            $usage = [
                'total_uses' => $coupon->used_count,
                'usage_limit' => $coupon->usage_limit,
                'remaining_uses' => $coupon->usage_limit ? $coupon->usage_limit - $coupon->used_count : null,
            ];

            return response()->json($usage);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch coupon usage',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}