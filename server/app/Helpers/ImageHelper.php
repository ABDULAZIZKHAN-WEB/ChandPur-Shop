<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class ImageHelper
{
    /**
     * Create a sample SVG image for categories and products
     */
    public static function createSampleImage($text, $width = 400, $height = 300, $bgColor = '#f8f9fa', $textColor = '#6c757d', $folder = 'products')
    {
        // Create SVG content
        $svg = '<?xml version="1.0" encoding="UTF-8"?>
<svg width="' . $width . '" height="' . $height . '" xmlns="http://www.w3.org/2000/svg">
  <rect width="' . $width . '" height="' . $height . '" fill="' . $bgColor . '" stroke="#dee2e6" stroke-width="2"/>
  <text x="' . ($width / 2) . '" y="' . ($height / 2 - 10) . '" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="' . $textColor . '" text-anchor="middle" dominant-baseline="middle">' . htmlspecialchars($text) . '</text>
  <text x="' . ($width / 2) . '" y="' . ($height / 2 + 15) . '" font-family="Arial, sans-serif" font-size="12" fill="#adb5bd" text-anchor="middle" dominant-baseline="middle">Sample Image</text>
</svg>';

        // Generate unique filename
        $filename = $folder . '/' . strtolower(str_replace([' ', '&', '-'], ['_', 'and', '_'], $text)) . '_' . time() . '.svg';
        
        // Store the image
        Storage::disk('public')->put($filename, $svg);
        
        return $filename;
    }

    /**
     * Create category-specific sample images with appropriate colors
     */
    public static function createCategoryImage($categoryName)
    {
        $colors = [
            'Electronics' => ['#e3f2fd', '#1976d2'],
            'Fashion' => ['#fce4ec', '#c2185b'],
            'Home & Garden' => ['#e8f5e8', '#388e3c'],
            'Sports & Fitness' => ['#fff3e0', '#f57c00'],
            'Books & Media' => ['#f3e5f5', '#7b1fa2'],
            'Health & Beauty' => ['#e0f2f1', '#00796b'],
            'Toys & Games' => ['#fff8e1', '#fbc02d'],
            'Automotive' => ['#e8eaf6', '#3f51b5'],
        ];

        $bgColor = '#f8f9fa';
        $textColor = '#6c757d';

        foreach ($colors as $category => $colorPair) {
            if (stripos($categoryName, $category) !== false) {
                $bgColor = $colorPair[0];
                $textColor = $colorPair[1];
                break;
            }
        }

        return self::createSampleImage($categoryName, 300, 200, $bgColor, $textColor, 'categories');
    }

    /**
     * Create product-specific sample images
     */
    public static function createProductImage($productName)
    {
        return self::createSampleImage($productName, 400, 400, '#ffffff', '#495057', 'products');
    }

    /**
     * Create banner images
     */
    public static function createBannerImage($bannerTitle)
    {
        return self::createSampleImage($bannerTitle, 800, 300, '#007bff', '#ffffff', 'banners');
    }
}