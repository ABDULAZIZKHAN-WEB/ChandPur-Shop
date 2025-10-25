<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductAttribute;
use App\Helpers\ImageHelper;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing products and attributes
        ProductAttribute::truncate();
        Product::truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $products = [
            // Electronics - Smartphones
            [
                'name' => 'iPhone 15 Pro',
                'category' => 'smartphones',
                'description' => 'The latest iPhone with advanced camera system and A17 Pro chip. Features titanium design, Action Button, and USB-C connectivity.',
                'short_description' => 'Latest iPhone with titanium design and A17 Pro chip',
                'price' => 999.00,
                'compare_price' => 1099.00,
                'cost_price' => 750.00,
                'quantity' => 50,
                'featured' => true,
                'attributes' => [
                    ['size' => '128GB', 'color' => 'Natural Titanium', 'additional_price' => 0, 'quantity' => 20],
                    ['size' => '256GB', 'color' => 'Natural Titanium', 'additional_price' => 100, 'quantity' => 15],
                    ['size' => '512GB', 'color' => 'Blue Titanium', 'additional_price' => 300, 'quantity' => 15],
                ]
            ],
            [
                'name' => 'Samsung Galaxy S24 Ultra',
                'category' => 'smartphones',
                'description' => 'Premium Android smartphone with S Pen, advanced camera system, and powerful performance.',
                'short_description' => 'Premium Android with S Pen and advanced cameras',
                'price' => 899.00,
                'compare_price' => 999.00,
                'cost_price' => 650.00,
                'quantity' => 40,
                'featured' => true,
                'attributes' => [
                    ['size' => '256GB', 'color' => 'Titanium Gray', 'additional_price' => 0, 'quantity' => 20],
                    ['size' => '512GB', 'color' => 'Titanium Black', 'additional_price' => 200, 'quantity' => 20],
                ]
            ],
            [
                'name' => 'Google Pixel 8 Pro',
                'category' => 'smartphones',
                'description' => 'Google\'s flagship smartphone with advanced AI features and exceptional camera capabilities.',
                'short_description' => 'Google flagship with AI features and great camera',
                'price' => 699.00,
                'cost_price' => 500.00,
                'quantity' => 30,
                'featured' => false,
            ],

            // Electronics - Laptops
            [
                'name' => 'MacBook Pro 14-inch M3',
                'category' => 'laptops',
                'description' => 'Powerful laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life.',
                'short_description' => 'Powerful MacBook Pro with M3 chip',
                'price' => 1599.00,
                'compare_price' => 1799.00,
                'cost_price' => 1200.00,
                'quantity' => 25,
                'featured' => true,
                'attributes' => [
                    ['size' => '512GB SSD', 'color' => 'Space Gray', 'additional_price' => 0, 'quantity' => 15],
                    ['size' => '1TB SSD', 'color' => 'Silver', 'additional_price' => 400, 'quantity' => 10],
                ]
            ],
            [
                'name' => 'Dell XPS 13',
                'category' => 'laptops',
                'description' => 'Ultra-portable laptop with stunning InfinityEdge display and premium build quality.',
                'short_description' => 'Ultra-portable laptop with premium design',
                'price' => 1299.00,
                'cost_price' => 950.00,
                'quantity' => 30,
                'featured' => false,
            ],

            // Electronics - Headphones
            [
                'name' => 'Sony WH-1000XM5',
                'category' => 'headphones',
                'description' => 'Industry-leading noise canceling headphones with exceptional sound quality and comfort.',
                'short_description' => 'Premium noise-canceling headphones',
                'price' => 349.00,
                'compare_price' => 399.00,
                'cost_price' => 250.00,
                'quantity' => 60,
                'featured' => true,
                'attributes' => [
                    ['size' => 'Standard', 'color' => 'Black', 'additional_price' => 0, 'quantity' => 30],
                    ['size' => 'Standard', 'color' => 'Silver', 'additional_price' => 0, 'quantity' => 30],
                ]
            ],
            [
                'name' => 'AirPods Pro (2nd Gen)',
                'category' => 'headphones',
                'description' => 'Apple\'s premium wireless earbuds with active noise cancellation and spatial audio.',
                'short_description' => 'Premium wireless earbuds with ANC',
                'price' => 249.00,
                'cost_price' => 180.00,
                'quantity' => 80,
                'featured' => true,
            ],

            // Fashion - Men's Clothing
            [
                'name' => 'Classic Cotton T-Shirt',
                'category' => 'mens-clothing',
                'description' => 'Comfortable and versatile cotton t-shirt perfect for everyday wear.',
                'short_description' => 'Comfortable cotton t-shirt for everyday wear',
                'price' => 29.99,
                'compare_price' => 39.99,
                'cost_price' => 15.00,
                'quantity' => 100,
                'featured' => false,
                'attributes' => [
                    ['size' => 'S', 'color' => 'White', 'additional_price' => 0, 'quantity' => 20],
                    ['size' => 'M', 'color' => 'White', 'additional_price' => 0, 'quantity' => 30],
                    ['size' => 'L', 'color' => 'Black', 'additional_price' => 0, 'quantity' => 25],
                    ['size' => 'XL', 'color' => 'Navy', 'additional_price' => 0, 'quantity' => 25],
                ]
            ],
            [
                'name' => 'Slim Fit Jeans',
                'category' => 'mens-clothing',
                'description' => 'Modern slim fit jeans made from premium denim with stretch comfort.',
                'short_description' => 'Modern slim fit jeans with stretch comfort',
                'price' => 79.99,
                'compare_price' => 99.99,
                'cost_price' => 45.00,
                'quantity' => 75,
                'featured' => false,
                'attributes' => [
                    ['size' => '30', 'color' => 'Dark Blue', 'additional_price' => 0, 'quantity' => 15],
                    ['size' => '32', 'color' => 'Dark Blue', 'additional_price' => 0, 'quantity' => 20],
                    ['size' => '34', 'color' => 'Black', 'additional_price' => 0, 'quantity' => 20],
                    ['size' => '36', 'color' => 'Light Blue', 'additional_price' => 0, 'quantity' => 20],
                ]
            ],

            // Fashion - Women's Clothing
            [
                'name' => 'Elegant Summer Dress',
                'category' => 'womens-clothing',
                'description' => 'Beautiful and elegant summer dress perfect for special occasions and casual outings.',
                'short_description' => 'Elegant summer dress for special occasions',
                'price' => 89.99,
                'compare_price' => 119.99,
                'cost_price' => 50.00,
                'quantity' => 50,
                'featured' => true,
                'attributes' => [
                    ['size' => 'XS', 'color' => 'Floral Blue', 'additional_price' => 0, 'quantity' => 10],
                    ['size' => 'S', 'color' => 'Floral Blue', 'additional_price' => 0, 'quantity' => 15],
                    ['size' => 'M', 'color' => 'Solid Black', 'additional_price' => 0, 'quantity' => 15],
                    ['size' => 'L', 'color' => 'Solid Red', 'additional_price' => 0, 'quantity' => 10],
                ]
            ],

            // Home & Garden - Furniture
            [
                'name' => 'Modern Office Chair',
                'category' => 'furniture',
                'description' => 'Ergonomic office chair with lumbar support and adjustable height for maximum comfort.',
                'short_description' => 'Ergonomic office chair with lumbar support',
                'price' => 299.99,
                'compare_price' => 399.99,
                'cost_price' => 180.00,
                'quantity' => 30,
                'featured' => false,
                'attributes' => [
                    ['size' => 'Standard', 'color' => 'Black', 'additional_price' => 0, 'quantity' => 15],
                    ['size' => 'Standard', 'color' => 'Gray', 'additional_price' => 0, 'quantity' => 15],
                ]
            ],

            // Sports & Fitness - Gym Equipment
            [
                'name' => 'Adjustable Dumbbell Set',
                'category' => 'gym-equipment',
                'description' => 'Space-saving adjustable dumbbell set perfect for home workouts and strength training.',
                'short_description' => 'Space-saving adjustable dumbbells for home workouts',
                'price' => 199.99,
                'compare_price' => 249.99,
                'cost_price' => 120.00,
                'quantity' => 40,
                'featured' => true,
                'attributes' => [
                    ['size' => '5-50 lbs', 'color' => 'Black/Red', 'additional_price' => 0, 'quantity' => 20],
                    ['size' => '5-80 lbs', 'color' => 'Black/Blue', 'additional_price' => 100, 'quantity' => 20],
                ]
            ],

            // Books & Media - Fiction
            [
                'name' => 'The Great Adventure Novel',
                'category' => 'fiction-books',
                'description' => 'An epic adventure novel that takes readers on a thrilling journey across mysterious lands.',
                'short_description' => 'Epic adventure novel with thrilling journey',
                'price' => 19.99,
                'compare_price' => 24.99,
                'cost_price' => 8.00,
                'quantity' => 200,
                'featured' => false,
            ],

            // Health & Beauty - Skincare
            [
                'name' => 'Premium Face Moisturizer',
                'category' => 'skincare',
                'description' => 'Luxurious face moisturizer with natural ingredients for healthy, glowing skin.',
                'short_description' => 'Luxurious moisturizer for healthy, glowing skin',
                'price' => 49.99,
                'compare_price' => 59.99,
                'cost_price' => 25.00,
                'quantity' => 80,
                'featured' => false,
            ],
        ];

        foreach ($products as $productData) {
            $categorySlug = $productData['category'];
            $attributes = $productData['attributes'] ?? [];
            $image = $productData['image'] ?? null;
            $gallery = $productData['gallery'] ?? [];
            unset($productData['category'], $productData['attributes'], $productData['image'], $productData['gallery']);

            $category = Category::where('slug', $categorySlug)->first();
            if (!$category) continue;

            // Create product image if not provided
            if (!$image) {
                $image = ImageHelper::createProductImage($productData['name']);
            }

            $product = Product::create([
                'category_id' => $category->id,
                'name' => $productData['name'],
                'slug' => Str::slug($productData['name']),
                'description' => $productData['description'],
                'short_description' => $productData['short_description'],
                'price' => $productData['price'],
                'compare_price' => $productData['compare_price'] ?? null,
                'cost_price' => $productData['cost_price'],
                'sku' => 'SKU-' . strtoupper(Str::random(8)),
                'barcode' => '123456789' . rand(100, 999),
                'quantity' => $productData['quantity'],
                'track_quantity' => true,
                'weight' => rand(100, 5000) / 100, // Random weight between 1-50 kg
                'image' => $image,
                'gallery' => $gallery,
                'status' => 'active',
                'featured' => $productData['featured'],
                'meta_title' => $productData['name'] . ' - Best Price Online',
                'meta_description' => $productData['short_description'],
            ]);

            // Create product attributes if any
            foreach ($attributes as $attr) {
                ProductAttribute::create([
                    'product_id' => $product->id,
                    'size' => $attr['size'],
                    'color' => $attr['color'],
                    'additional_price' => $attr['additional_price'],
                    'quantity' => $attr['quantity'],
                ]);
            }
        }
    }
}
