<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index()
    {
        try {
            $wishlistItems = Wishlist::where('user_id', auth()->id())
                ->with('product')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($wishlistItems);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            // Check if product exists and is active
            $product = Product::where('id', $request->product_id)
                ->where('status', 'active')
                ->firstOrFail();

            // Check if already in wishlist
            $existingItem = Wishlist::where('user_id', auth()->id())
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingItem) {
                return response()->json(['message' => 'Product already in wishlist'], 400);
            }

            $wishlistItem = Wishlist::create([
                'user_id' => auth()->id(),
                'product_id' => $request->product_id,
            ]);

            return response()->json([
                'message' => 'Product added to wishlist successfully',
                'item' => $wishlistItem->load('product')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to add product to wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $wishlistItem = Wishlist::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $wishlistItem->delete();

            return response()->json(['message' => 'Product removed from wishlist successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to remove product from wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}