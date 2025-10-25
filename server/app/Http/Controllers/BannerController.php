<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function active(Request $request)
    {
        try {
            $query = Banner::where('status', 'active')
                ->orderBy('sort_order');

            // Filter by position if provided
            if ($request->filled('position')) {
                $query->where('position', $request->position);
            }

            $banners = $query->get();

            return response()->json($banners);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch banners',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}