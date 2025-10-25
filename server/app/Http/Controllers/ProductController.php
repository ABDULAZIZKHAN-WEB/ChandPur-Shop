<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::where('status', 'active')
                ->with('category');

            // Search
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            }

            // Category filter
            if ($request->filled('category')) {
                $category = Category::where('slug', $request->category)->first();
                if ($category) {
                    $query->where('category_id', $category->id);
                }
            }

            // Price filter
            if ($request->filled('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->filled('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }

            // In stock filter
            if ($request->boolean('in_stock')) {
                $query->where('quantity', '>', 0);
            }

            // Featured filter
            if ($request->boolean('featured')) {
                $query->where('featured', true);
            }

            // Sorting
            switch ($request->get('sort', 'newest')) {
                case 'price_low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_high':
                    $query->orderBy('price', 'desc');
                    break;
                case 'name':
                    $query->orderBy('name', 'asc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }

            $products = $query->paginate($request->get('per_page', 12));
            
            // Add stock information to each product
            $products->getCollection()->transform(function ($product) {
                $product->is_in_stock = $product->quantity > 0;
                $product->stock_status = $product->quantity > 0 ? 'in_stock' : 'out_of_stock';
                return $product;
            });

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($slug)
    {
        try {
            $product = Product::where('slug', $slug)
                ->where('status', 'active')
                ->with(['category', 'attributes'])
                ->first();

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            // Get related products
            $relatedProducts = Product::where('status', 'active')
                ->where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->with('category')
                ->take(4)
                ->get();

            // Add stock information to product and related products
            $product->is_in_stock = $product->quantity > 0;
            $product->stock_status = $product->quantity > 0 ? 'in_stock' : 'out_of_stock';
            
            $relatedProducts->transform(function ($relatedProduct) {
                $relatedProduct->is_in_stock = $relatedProduct->quantity > 0;
                $relatedProduct->stock_status = $relatedProduct->quantity > 0 ? 'in_stock' : 'out_of_stock';
                return $relatedProduct;
            });

            return response()->json([
                'product' => $product,
                'related_products' => $relatedProducts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function featured()
    {
        try {
            $products = Product::where('status', 'active')
                ->where('featured', true)
                ->with('category')
                ->take(8)
                ->get()
                ->map(function ($product) {
                    $product->is_in_stock = $product->quantity > 0;
                    $product->stock_status = $product->quantity > 0 ? 'in_stock' : 'out_of_stock';
                    return $product;
                });

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch featured products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $request->validate([
                'q' => 'required|string|min:2',
            ]);

            $search = $request->q;
            $products = Product::where('status', 'active')
                ->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('description', 'like', "%{$search}%")
                          ->orWhere('sku', 'like', "%{$search}%");
                })
                ->with('category')
                ->paginate(12);
                
            // Add stock information to each product
            $products->getCollection()->transform(function ($product) {
                $product->is_in_stock = $product->quantity > 0;
                $product->stock_status = $product->quantity > 0 ? 'in_stock' : 'out_of_stock';
                return $product;
            });

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to search products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function byCategory($slug, Request $request)
    {
        try {
            $category = Category::where('slug', $slug)
                ->where('status', 'active')
                ->first();

            if (!$category) {
                return response()->json(['message' => 'Category not found'], 404);
            }

            // Get category IDs to search in (main category + its children)
            $categoryIds = [$category->id];
            
            // If this is a parent category, include all its children
            $childCategories = Category::where('parent_id', $category->id)
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
            
            $categoryIds = array_merge($categoryIds, $childCategories);

            $query = Product::where('status', 'active')
                ->whereIn('category_id', $categoryIds)
                ->with('category');

            // Apply filters similar to index method
            if ($request->filled('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->filled('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }

            if ($request->boolean('in_stock')) {
                $query->where('quantity', '>', 0);
            }

            // Sorting
            switch ($request->get('sort', 'newest')) {
                case 'price_low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_high':
                    $query->orderBy('price', 'desc');
                    break;
                case 'name':
                    $query->orderBy('name', 'asc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }

            $products = $query->paginate($request->get('per_page', 12));
            
            // Add stock information to each product
            $products->getCollection()->transform(function ($product) {
                $product->is_in_stock = $product->quantity > 0;
                $product->stock_status = $product->quantity > 0 ? 'in_stock' : 'out_of_stock';
                return $product;
            });

            return response()->json([
                'category' => $category,
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch products by category',
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
}