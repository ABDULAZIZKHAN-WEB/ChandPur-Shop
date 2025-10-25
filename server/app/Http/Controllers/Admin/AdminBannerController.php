<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\StorageService;

class AdminBannerController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Banner::query();

            if ($request->filled('search')) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('position')) {
                $query->where('position', $request->position);
            }

            $banners = $query->orderBy('sort_order')
                ->paginate($request->get('per_page', 15));

            return response()->json($banners);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch banners',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'link' => 'nullable|url',
                'position' => 'required|in:home_slider,sidebar,footer',
                'status' => 'required|in:active,inactive',
                'sort_order' => 'nullable|integer|min:0',
            ]);

            $data = $request->all();
            
            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('banners', 'public');
                // Sync to public directory for Windows compatibility
                StorageService::syncFileToPublic($data['image']);
            }

            $data['sort_order'] = $request->sort_order ?? 0;
            $data['clicks'] = 0;

            $banner = Banner::create($data);

            return response()->json([
                'message' => 'Banner created successfully',
                'banner' => $banner
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create banner',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $banner = Banner::findOrFail($id);
            return response()->json($banner);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Banner not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $banner = Banner::findOrFail($id);

            $request->validate([
                'title' => 'required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'link' => 'nullable|url',
                'position' => 'required|in:home_slider,sidebar,footer',
                'status' => 'required|in:active,inactive',
                'sort_order' => 'nullable|integer|min:0',
            ]);

            $data = $request->except('image');
            
            if ($request->hasFile('image')) {
                // Delete old image
                if ($banner->image) {
                    StorageService::deleteFile($banner->image);
                }
                $data['image'] = $request->file('image')->store('banners', 'public');
                // Sync to public directory for Windows compatibility
                StorageService::syncFileToPublic($data['image']);
            }

            $banner->update($data);

            return response()->json([
                'message' => 'Banner updated successfully',
                'banner' => $banner
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update banner',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle POST requests with _method=PUT for FormData uploads
     */
    public function updatePost(Request $request, $id)
    {
        return $this->update($request, $id);
    }

    public function destroy($id)
    {
        try {
            $banner = Banner::findOrFail($id);

            // Delete image file
            if ($banner->image) {
                StorageService::deleteFile($banner->image);
            }

            $banner->delete();

            return response()->json(['message' => 'Banner deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete banner',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function reorder(Request $request)
    {
        try {
            $request->validate([
                'banners' => 'required|array',
                'banners.*.id' => 'required|exists:banners,id',
                'banners.*.sort_order' => 'required|integer|min:0',
            ]);

            foreach ($request->banners as $bannerData) {
                Banner::where('id', $bannerData['id'])
                    ->update(['sort_order' => $bannerData['sort_order']]);
            }

            return response()->json(['message' => 'Banners reordered successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to reorder banners',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}