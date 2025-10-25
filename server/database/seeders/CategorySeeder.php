<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Helpers\ImageHelper;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing categories
        Category::truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = [
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Latest electronic gadgets and devices',
                'status' => 'active',
                'sort_order' => 1,
                'children' => [
                    [
                        'name' => 'Smartphones',
                        'slug' => 'smartphones',
                        'description' => 'Latest smartphones and mobile devices',
                    ],
                    [
                        'name' => 'Laptops',
                        'slug' => 'laptops',
                        'description' => 'Laptops and notebooks',
                    ],
                    [
                        'name' => 'Headphones',
                        'slug' => 'headphones',
                        'description' => 'Audio devices and headphones',
                    ],
                    [
                        'name' => 'Cameras',
                        'slug' => 'cameras',
                        'description' => 'Digital cameras and accessories',
                    ],
                    [
                        'name' => 'Tablets',
                        'slug' => 'tablets',
                        'description' => 'Tablets and e-readers',
                    ],
                ]
            ],
            [
                'name' => 'Fashion',
                'slug' => 'fashion',
                'description' => 'Trendy clothing and accessories',
                'status' => 'active',
                'sort_order' => 2,
                'children' => [
                    [
                        'name' => "Men's Clothing",
                        'slug' => 'mens-clothing',
                        'description' => 'Clothing for men',
                    ],
                    [
                        'name' => "Women's Clothing",
                        'slug' => 'womens-clothing',
                        'description' => 'Clothing for women',
                    ],
                    [
                        'name' => 'Shoes',
                        'slug' => 'shoes',
                        'description' => 'Footwear for all occasions',
                    ],
                    [
                        'name' => 'Accessories',
                        'slug' => 'accessories',
                        'description' => 'Fashion accessories',
                    ],
                    [
                        'name' => 'Jewelry',
                        'slug' => 'jewelry',
                        'description' => 'Jewelry and watches',
                    ],
                ]
            ],
            [
                'name' => 'Home & Garden',
                'slug' => 'home-garden',
                'description' => 'Everything for your home and garden',
                'status' => 'active',
                'sort_order' => 3,
                'children' => [
                    [
                        'name' => 'Furniture',
                        'slug' => 'furniture',
                        'description' => 'Home furniture and decor',
                    ],
                    [
                        'name' => 'Kitchen',
                        'slug' => 'kitchen',
                        'description' => 'Kitchen appliances and tools',
                    ],
                    [
                        'name' => 'Garden Tools',
                        'slug' => 'garden-tools',
                        'description' => 'Gardening equipment and tools',
                    ],
                    [
                        'name' => 'Decor',
                        'slug' => 'decor',
                        'description' => 'Home decoration items',
                    ],
                ]
            ],
            [
                'name' => 'Sports & Fitness',
                'slug' => 'sports-fitness',
                'description' => 'Sports equipment and fitness gear',
                'status' => 'active',
                'sort_order' => 4,
                'children' => [
                    [
                        'name' => 'Gym Equipment',
                        'slug' => 'gym-equipment',
                        'description' => 'Exercise and gym equipment',
                    ],
                    [
                        'name' => 'Outdoor Sports',
                        'slug' => 'outdoor-sports',
                        'description' => 'Outdoor sports equipment',
                    ],
                    [
                        'name' => 'Sportswear',
                        'slug' => 'sportswear',
                        'description' => 'Athletic clothing and gear',
                    ],
                ]
            ],
            [
                'name' => 'Books & Media',
                'slug' => 'books-media',
                'description' => 'Books, movies, and digital media',
                'status' => 'active',
                'sort_order' => 5,
                'children' => [
                    [
                        'name' => 'Fiction Books',
                        'slug' => 'fiction-books',
                        'description' => 'Fiction and literature',
                    ],
                    [
                        'name' => 'Non-Fiction',
                        'slug' => 'non-fiction',
                        'description' => 'Educational and reference books',
                    ],
                    [
                        'name' => 'Movies & TV',
                        'slug' => 'movies-tv',
                        'description' => 'Movies and TV shows',
                    ],
                ]
            ],
            [
                'name' => 'Health & Beauty',
                'slug' => 'health-beauty',
                'description' => 'Health and beauty products',
                'status' => 'active',
                'sort_order' => 6,
                'children' => [
                    [
                        'name' => 'Skincare',
                        'slug' => 'skincare',
                        'description' => 'Skincare products and treatments',
                    ],
                    [
                        'name' => 'Makeup',
                        'slug' => 'makeup',
                        'description' => 'Cosmetics and makeup',
                    ],
                    [
                        'name' => 'Health Supplements',
                        'slug' => 'health-supplements',
                        'description' => 'Vitamins and supplements',
                    ],
                ]
            ],
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            // Create category image
            $categoryData['image'] = ImageHelper::createCategoryImage($categoryData['name']);

            $category = Category::create($categoryData);

            foreach ($children as $index => $childData) {
                Category::create([
                    'name' => $childData['name'],
                    'slug' => $childData['slug'],
                    'description' => $childData['description'],
                    'image' => ImageHelper::createCategoryImage($childData['name']),
                    'parent_id' => $category->id,
                    'status' => 'active',
                    'sort_order' => $index + 1,
                ]);
            }
        }
    }
}