<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Banner;
use App\Helpers\ImageHelper;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing banners
        Banner::truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $banners = [
            [
                'title' => 'Summer Sale - Up to 50% Off',
                'image' => ImageHelper::createBannerImage('Summer Sale - Up to 50% Off'),
                'link' => '/shop?sale=summer',
                'position' => 'home_slider',
                'status' => 'active',
                'sort_order' => 1,
                'clicks' => 0,
            ],
            [
                'title' => 'New Electronics Collection',
                'image' => ImageHelper::createBannerImage('New Electronics Collection'),
                'link' => '/category/electronics',
                'position' => 'home_slider',
                'status' => 'active',
                'sort_order' => 2,
                'clicks' => 0,
            ],
            [
                'title' => 'Fashion Week Special',
                'image' => ImageHelper::createBannerImage('Fashion Week Special'),
                'link' => '/category/fashion',
                'position' => 'home_slider',
                'status' => 'active',
                'sort_order' => 3,
                'clicks' => 0,
            ],
            [
                'title' => 'Home & Garden Essentials',
                'image' => ImageHelper::createBannerImage('Home & Garden Essentials'),
                'link' => '/category/home-garden',
                'position' => 'sidebar',
                'status' => 'active',
                'sort_order' => 1,
                'clicks' => 0,
            ],
            [
                'title' => 'Fitness Equipment Sale',
                'image' => ImageHelper::createBannerImage('Fitness Equipment Sale'),
                'link' => '/category/sports-fitness',
                'position' => 'sidebar',
                'status' => 'active',
                'sort_order' => 2,
                'clicks' => 0,
            ],
        ];

        foreach ($banners as $bannerData) {
            Banner::create($bannerData);
        }
    }
}