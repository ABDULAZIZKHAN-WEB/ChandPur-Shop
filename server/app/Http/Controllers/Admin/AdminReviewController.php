<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Review::with(['user:id,name', 'product:id,name']);

            if ($request->filled('search')) {
                $query->whereHas('product', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                })->orWhereHas('user', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('rating')) {
                $query->where('rating', $request->rating);
            }

            $reviews = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json($reviews);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch reviews',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function approve($id)
    {
        try {
            $review = Review::findOrFail($id);
            $review->update(['status' => 'approved']);

            return response()->json([
                'message' => 'Review approved successfully',
                'review' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to approve review',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function reject($id)
    {
        try {
            $review = Review::findOrFail($id);
            $review->update(['status' => 'rejected']);

            return response()->json([
                'message' => 'Review rejected successfully',
                'review' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to reject review',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $review = Review::findOrFail($id);
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