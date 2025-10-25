<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing settings
        Setting::truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $settings = [
            // General settings
            [
                'key' => 'site_name',
                'value' => 'ChandPur-Shop Online Store',
                'type' => 'text',
                'group' => 'general',
            ],
            [
                'key' => 'site_description',
                'value' => 'Your one-stop shop for all your needs',
                'type' => 'text',
                'group' => 'general',
            ],
            [
                'key' => 'contact_email',
                'value' => 'abdulazizkhan.web@gmail.com',
                'type' => 'text',
                'group' => 'general',
            ],
            [
                'key' => 'contact_phone',
                'value' => '+880 1907-717145',
                'type' => 'text',
                'group' => 'general',
            ],
            [
                'key' => 'address',
                'value' => 'Mirpur 10, Dhaka Bangladesh',
                'type' => 'text',
                'group' => 'general',
            ],
            
            // Social media
            [
                'key' => 'facebook_url',
                'value' => 'https://facebook.com/chandpur-shop',
                'type' => 'text',
                'group' => 'social',
            ],
            [
                'key' => 'twitter_url',
                'value' => 'https://twitter.com/chandpur-shop',
                'type' => 'text',
                'group' => 'social',
            ],
            [
                'key' => 'instagram_url',
                'value' => 'https://instagram.com/chandpur-shop',
                'type' => 'text',
                'group' => 'social',
            ],
            
            // Store settings
            [
                'key' => 'currency_symbol',
                'value' => '৳',
                'type' => 'text',
                'group' => 'store',
            ],
            [
                'key' => 'currency_code',
                'value' => 'BDT',
                'type' => 'text',
                'group' => 'store',
            ],
            [
                'key' => 'tax_rate',
                'value' => '8.5',
                'type' => 'number',
                'group' => 'store',
            ],
            [
                'key' => 'shipping_cost',
                'value' => '9.99',
                'type' => 'number',
                'group' => 'shipping',
            ],
            [
                'key' => 'free_shipping_threshold',
                'value' => '75.00',
                'type' => 'number',
                'group' => 'shipping',
            ],
            
            // Email settings
            [
                'key' => 'order_notification_email',
                'value' => 'orders@chandpur-shop.com',
                'type' => 'text',
                'group' => 'email',
            ],
            [
                'key' => 'support_email',
                'value' => 'support@chandpur-shop.com',
                'type' => 'text',
                'group' => 'email',
            ],
        ];

        foreach ($settings as $settingData) {
            Setting::create($settingData);
        }
    }
}