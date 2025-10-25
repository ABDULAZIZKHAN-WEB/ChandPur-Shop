<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing users
        User::truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@shopeasy.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_admin' => true,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create customer user
        User::create([
            'name' => 'John Customer',
            'email' => 'john.customer@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'is_admin' => false,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create another customer user
        User::create([
            'name' => 'Jane Shopper',
            'email' => 'jane.shopper@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'is_admin' => false,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
    }
}