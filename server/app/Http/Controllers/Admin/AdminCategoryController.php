<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Services\StorageService;

class AdminCategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Category::withCount('products');

            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $categories = $query->orderBy('sort_order')->paginate($request->get('per_page', 15));

            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch categories',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'parent_id' => 'nullable|exists:categories,id',
                'status' => 'required|in:active,inactive',
                'sort_order' => 'nullable|integer|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            // Generate unique slug
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;
            
            while (Category::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('categories', 'public');
                // Sync to public directory for Windows compatibility
                StorageService::syncFileToPublic($imagePath);
            }

            $category = Category::create([
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'image' => $imagePath,
                'parent_id' => $request->parent_id,
                'status' => $request->status,
                'sort_order' => $request->sort_order ?? 0,
            ]);

            return response()->json([
                'message' => 'Category created successfully',
                'category' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create category',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = Category::with(['parent', 'children'])->findOrFail($id);
            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Category not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'parent_id' => 'nullable|exists:categories,id',
                'status' => 'required|in:active,inactive',
                'sort_order' => 'nullable|integer|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            // Generate unique slug (if name changed)
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;
            
            // Only check for uniqueness if the slug is different from current
            if ($slug !== $category->slug) {
                while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                    $slug = $originalSlug . '-' . $counter;
                    $counter++;
                }
            }

            $imagePath = $category->image;
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($category->image) {
                    StorageService::deleteFile($category->image);
                }
                $imagePath = $request->file('image')->store('categories', 'public');
                // Sync to public directory for Windows compatibility
                StorageService::syncFileToPublic($imagePath);
            }

            $category->update([
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'image' => $imagePath,
                'parent_id' => $request->parent_id,
                'status' => $request->status,
                'sort_order' => $request->sort_order ?? $category->sort_order,
            ]);

            return response()->json([
                'message' => 'Category updated successfully',
                'category' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update category',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Handle update requests that come as POST with _method=PUT
    public function updatePost(Request $request, $id)
    {
        return $this->update($request, $id);
    }

    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);

            // Check if category has products
            if ($category->products()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete category with products'
                ], 400);
            }

            // Check if category has children
            if ($category->children()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete category with subcategories'
                ], 400);
            }

            // Delete image if exists
            if ($category->image) {
                StorageService::deleteFile($category->image);
            }

            $category->delete();

            return response()->json(['message' => 'Category deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete category',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function reorder(Request $request)
    {
        try {
            $request->validate([
                'categories' => 'required|array',
                'categories.*.id' => 'required|exists:categories,id',
                'categories.*.sort_order' => 'required|integer|min:0',
            ]);

            foreach ($request->categories as $categoryData) {
                Category::where('id', $categoryData['id'])
                    ->update(['sort_order' => $categoryData['sort_order']]);
            }

            return response()->json(['message' => 'Categories reordered successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to reorder categories',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}