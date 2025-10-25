<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing coupons
        Coupon::truncate();

        $coupons = [
           
        ];

        foreach ($coupons as $couponData) {
            Coupon::create($couponData);
        }
    }
}