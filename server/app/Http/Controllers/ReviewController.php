<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function byProduct($productId)
    {
        try {
            $reviews = Review::where('product_id', $productId)
                ->where('status', 'approved')
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            // Calculate average rating
            $averageRating = Review::where('product_id', $productId)
                ->where('status', 'approved')
                ->avg('rating');

            // Rating breakdown
            $ratingBreakdown = [];
            for ($i = 1; $i <= 5; $i++) {
                $count = Review::where('product_id', $productId)
                    ->where('status', 'approved')
                    ->where('rating', $i)
                    ->count();
                $ratingBreakdown[$i] = $count;
            }

            return response()->json([
                'reviews' => $reviews,
                'average_rating' => round($averageRating, 1),
                'total_reviews' => $reviews->total(),
                'rating_breakdown' => $ratingBreakdown,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch reviews',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|max:1000',
                'order_id' => 'nullable|exists:orders,id',
            ]);

            // Check if user has already reviewed this product
            $existingReview = Review::where('user_id', auth()->id())
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingReview) {
                return response()->json(['message' => 'You have already reviewed this product'], 400);
            }

            // If order_id is provided, verify user owns the order and has purchased the product
            if ($request->order_id) {
                $order = Order::where('id', $request->order_id)
                    ->where('user_id', auth()->id())
                    ->whereHas('items', function ($query) use ($request) {
                        $query->where('product_id', $request->product_id);
                    })
                    ->first();

                if (!$order) {
                    return response()->json(['message' => 'Invalid order or product not purchased'], 400);
                }
            }

            $review = Review::create([
                'user_id' => auth()->id(),
                'product_id' => $request->product_id,
                'order_id' => $request->order_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'status' => 'pending', // Reviews need approval
            ]);

            return response()->json([
                'message' => 'Review submitted successfully and is pending approval',
                'review' => $review->load('user:id,name')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to submit review',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|max:1000',
            ]);

            $review = Review::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $review->update([
                'rating' => $request->rating,
                'comment' => $request->comment,
                'status' => 'pending', // Re-submit for approval after edit
            ]);

            return response()->json([
                'message' => 'Review updated successfully and is pending approval',
                'review' => $review->load('user:id,name')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update review',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $review = Review::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $review->delete();

            return response()->json(['message' => 'Review deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete review',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}