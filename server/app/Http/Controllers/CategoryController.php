<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = Category::where('status', 'active')
                ->whereNull('parent_id') // Only parent categories
                ->with(['children' => function ($query) {
                    $query->where('status', 'active')
                        ->withCount('products')
                        ->orderBy('sort_order');
                }])
                ->withCount('products')
                ->orderBy('sort_order')
                ->get();

            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch categories',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($slug)
    {
        try {
            $category = Category::where('slug', $slug)
                ->where('status', 'active')
                ->with(['children' => function ($query) {
                    $query->where('status', 'active')
                        ->withCount('products');
                }])
                ->withCount('products')
                ->firstOrFail();

            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Category not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }
}