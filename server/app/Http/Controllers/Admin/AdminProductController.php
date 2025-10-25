<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Services\StorageService;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::with('category');

            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('sku', 'like', '%' . $request->search . '%');
                });
            }

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('featured')) {
                $query->where('featured', $request->boolean('featured'));
            }

            $products = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Product creation request received', ['data' => $request->all()]);
            
            $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'required|numeric|min:0',
                'compare_price' => 'nullable|numeric|min:0',
                'cost_price' => 'nullable|numeric|min:0',
                'sku' => 'required|string|unique:products,sku',
                'barcode' => 'nullable|string',
                'quantity' => 'required|integer|min:0',
                'track_quantity' => 'nullable|in:true,false,1,0,"1","0"',
                'weight' => 'nullable|numeric|min:0',
                'status' => 'required|in:active,inactive,draft',
                'featured' => 'nullable|in:true,false,1,0,"1","0"',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

            Log::info('Product validation passed');

            $data = $request->except('image');
            $data['slug'] = Str::slug($request->name);
            
            // Handle boolean conversion for FormData
            $data['track_quantity'] = in_array($request->input('track_quantity'), ['true', '1', 1, true], true);
            $data['featured'] = in_array($request->input('featured'), ['true', '1', 1, true], true);

            // Handle image upload
            if ($request->hasFile('image')) {
                Log::info('Image file detected, attempting to store');
                $imagePath = $request->file('image')->store('products', 'public');
                $data['image'] = $imagePath;
                Log::info('Image stored successfully', ['path' => $imagePath]);
                
                // Sync to public directory for Windows compatibility
                StorageService::syncFileToPublic($imagePath);
            }

            Log::info('Creating product with data', ['data' => $data]);
            $product = Product::create($data);
            Log::info('Product created successfully', ['product_id' => $product->id]);

            return response()->json([
                'message' => 'Product created successfully',
                'product' => $product->load('category')
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create product', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'error' => 'Failed to create product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::with(['category', 'attributes'])->findOrFail($id);
            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Product not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'required|numeric|min:0',
                'compare_price' => 'nullable|numeric|min:0',
                'cost_price' => 'nullable|numeric|min:0',
                'sku' => 'required|string|unique:products,sku,' . $id,
                'barcode' => 'nullable|string',
                'quantity' => 'required|integer|min:0',
                'track_quantity' => 'nullable|in:true,false,1,0,"1","0"',
                'weight' => 'nullable|numeric|min:0',
                'status' => 'required|in:active,inactive,draft',
                'featured' => 'nullable|in:true,false,1,0,"1","0"',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

            $data = $request->except('image');
            $data['slug'] = Str::slug($request->name);
            
            // Handle boolean conversion for FormData
            $data['track_quantity'] = in_array($request->input('track_quantity'), ['true', '1', 1, true], true);
            $data['featured'] = in_array($request->input('featured'), ['true', '1', 1, true], true);

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($product->image) {
                    StorageService::deleteFile($product->image);
                }
                
                $imagePath = $request->file('image')->store('products', 'public');
                $data['image'] = $imagePath;
                
                // Sync to public directory for Windows compatibility
                StorageService::syncFileToPublic($imagePath);
            }

            $product->update($data);

            return response()->json([
                'message' => 'Product updated successfully',
                'product' => $product->load('category')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);

            // Check if product has orders
            if ($product->orderItems()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete product with existing orders'
                ], 400);
            }

            // Delete product image if exists
            if ($product->image) {
                StorageService::deleteFile($product->image);
            }

            // Delete gallery images if exist
            if ($product->gallery) {
                foreach ($product->gallery as $image) {
                    Storage::disk('public')->delete($image);
                }
            }

            $product->delete();

            return response()->json(['message' => 'Product deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadGallery(Request $request, $id)
    {
        try {
            $request->validate([
                'images' => 'required|array',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

            $product = Product::findOrFail($id);
            $gallery = $product->gallery ?? [];

            foreach ($request->file('images') as $image) {
                $path = $image->store('products/gallery', 'public');
                $gallery[] = $path;
            }

            $product->update(['gallery' => $gallery]);

            return response()->json([
                'message' => 'Images uploaded successfully',
                'gallery' => $gallery
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to upload images',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteGalleryImage(Request $request, $id, $image)
    {
        try {
            $product = Product::findOrFail($id);
            $gallery = $product->gallery ?? [];

            $imageIndex = array_search($image, $gallery);
            if ($imageIndex !== false) {
                // Delete file from storage
                Storage::disk('public')->delete($image);
                
                // Remove from gallery array
                unset($gallery[$imageIndex]);
                $gallery = array_values($gallery); // Re-index array

                $product->update(['gallery' => $gallery]);

                return response()->json([
                    'message' => 'Image deleted successfully',
                    'gallery' => $gallery
                ]);
            }

            return response()->json(['message' => 'Image not found'], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete image',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function export()
    {
        try {
            $products = Product::with('category')->get();

            $csv = "Name,SKU,Price,Compare Price,Cost Price,Quantity,Category,Status,Featured\n";
            foreach ($products as $product) {
                $csv .= sprintf(
                    '"%s","%s",%s,%s,%s,%s,"%s","%s","%s"' . "\n",
                    $product->name,
                    $product->sku,
                    $product->price,
                    $product->compare_price ?? '',
                    $product->cost_price ?? '',
                    $product->quantity,
                    $product->category->name ?? '',
                    $product->status,
                    $product->featured ? 'Yes' : 'No'
                );
            }

            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="products-' . date('Y-m-d') . '.csv"');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to export products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function import(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:csv,txt'
            ]);

            $file = $request->file('file');
            $csvData = file_get_contents($file);
            $rows = array_map('str_getcsv', explode("\n", $csvData));
            $header = array_shift($rows);

            $imported = 0;
            $errors = [];

            foreach ($rows as $index => $row) {
                if (empty($row[0])) continue; // Skip empty rows

                try {
                    $data = array_combine($header, $row);
                    
                    // Find category by name
                    $category = Category::where('name', $data['Category'])->first();
                    if (!$category) {
                        $errors[] = "Row " . ($index + 2) . ": Category '{$data['Category']}' not found";
                        continue;
                    }

                    Product::create([
                        'name' => $data['Name'],
                        'slug' => Str::slug($data['Name']),
                        'sku' => $data['SKU'],
                        'price' => $data['Price'],
                        'compare_price' => $data['Compare Price'] ?: null,
                        'cost_price' => $data['Cost Price'] ?: null,
                        'quantity' => $data['Quantity'],
                        'category_id' => $category->id,
                        'status' => $data['Status'] ?? 'active',
                        'featured' => ($data['Featured'] ?? 'No') === 'Yes',
                        'track_quantity' => true,
                    ]);

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
                }
            }

            return response()->json([
                'message' => "Import completed. {$imported} products imported.",
                'imported' => $imported,
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to import products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // New attribute management methods
    public function getAttributes($id)
    {
        try {
            $product = Product::findOrFail($id);
            $attributes = $product->attributes()->get();
            
            return response()->json($attributes);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch product attributes',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function storeAttribute(Request $request, $id)
    {
        try {
            $request->validate([
                'size' => 'nullable|string|max:50',
                'color' => 'nullable|string|max:50',
                'additional_price' => 'nullable|numeric|min:-999999.99|max:999999.99',
                'quantity' => 'required|integer|min:0',
            ]);

            $product = Product::findOrFail($id);
            $attribute = $product->attributes()->create($request->all());

            return response()->json($attribute, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create product attribute',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateAttribute(Request $request, $id, $attributeId)
    {
        try {
            $request->validate([
                'size' => 'nullable|string|max:50',
                'color' => 'nullable|string|max:50',
                'additional_price' => 'nullable|numeric|min:-999999.99|max:999999.99',
                'quantity' => 'required|integer|min:0',
            ]);

            $product = Product::findOrFail($id);
            $attribute = $product->attributes()->findOrFail($attributeId);
            $attribute->update($request->all());

            return response()->json($attribute);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update product attribute',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteAttribute($id, $attributeId)
    {
        try {
            $product = Product::findOrFail($id);
            $attribute = $product->attributes()->findOrFail($attributeId);
            $attribute->delete();

            return response()->json(['message' => 'Attribute deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete product attribute',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // New inventory management methods
    public function lowStock(Request $request)
    {
        try {
            \Log::info('Low stock products request received', [
                'user_id' => auth()->id(),
                'user_is_admin' => auth()->check() && auth()->user()->is_admin,
                'request_params' => $request->all()
            ]);

            $query = Product::where('quantity', '<=', 10)
                ->where('track_quantity', true)
                ->with('category')
                ->orderBy('quantity');

            $products = $query->paginate($request->get('per_page', 15));

            \Log::info('Low stock products query executed', [
                'total_products' => $products->total()
            ]);

            return response()->json($products);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch low stock products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch low stock products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function outOfStock(Request $request)
    {
        try {
            \Log::info('Out of stock products request received', [
                'user_id' => auth()->id(),
                'user_is_admin' => auth()->check() && auth()->user()->is_admin,
                'request_params' => $request->all()
            ]);

            $query = Product::where('quantity', '<=', 0)
                ->where('track_quantity', true)
                ->with('category')
                ->orderBy('updated_at', 'desc');

            $products = $query->paginate($request->get('per_page', 15));

            \Log::info('Out of stock products query executed', [
                'total_products' => $products->total()
            ]);

            return response()->json($products);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch out of stock products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch out of stock products',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}