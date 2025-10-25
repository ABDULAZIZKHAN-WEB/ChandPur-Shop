<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_value',
        'max_discount',
        'usage_limit',
        'used_count',
        'applicable_categories',
        'applicable_products',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'applicable_categories' => 'array',
        'applicable_products' => 'array',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now());
    }

    public function scopeAvailable($query)
    {
        return $query->active()
                    ->where(function ($q) {
                        $q->whereNull('usage_limit')
                          ->orWhereRaw('used_count < usage_limit');
                    });
    }

    // Methods
    public function isValid($orderTotal = 0, $categoryIds = [], $productIds = [])
    {
        // Check if coupon is active
        if ($this->status !== 'active') {
            return false;
        }

        // Check date range
        if (now()->lt($this->start_date) || now()->gt($this->end_date)) {
            return false;
        }

        // Check usage limit
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return false;
        }

        // Check minimum order value
        if ($this->min_order_value && $orderTotal < $this->min_order_value) {
            return false;
        }

        // Check applicable categories
        if ($this->applicable_categories && !empty($categoryIds)) {
            if (!array_intersect($this->applicable_categories, $categoryIds)) {
                return false;
            }
        }

        // Check applicable products
        if ($this->applicable_products && !empty($productIds)) {
            if (!array_intersect($this->applicable_products, $productIds)) {
                return false;
            }
        }

        return true;
    }

    public function calculateDiscount($orderTotal)
    {
        if ($this->type === 'percentage') {
            $discount = ($orderTotal * $this->value) / 100;
            
            if ($this->max_discount) {
                $discount = min($discount, $this->max_discount);
            }
            
            return $discount;
        }

        return min($this->value, $orderTotal);
    }

    public function incrementUsage()
    {
        $this->increment('used_count');
    }
}