<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'size',
        'color',
        'additional_price',
        'quantity',
    ];

    protected $casts = [
        'additional_price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function cartItems()
    {
        return $this->hasMany(Cart::class, 'attribute_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'attribute_id');
    }

    // Accessors
    public function getTotalPriceAttribute()
    {
        return $this->product->price + $this->additional_price;
    }

    public function getDisplayNameAttribute()
    {
        $parts = [];
        if ($this->size) $parts[] = "Size: {$this->size}";
        if ($this->color) $parts[] = "Color: {$this->color}";
        
        return implode(', ', $parts);
    }

    // Methods
    public function decreaseQuantity($quantity)
    {
        $this->decrement('quantity', $quantity);
    }

    public function increaseQuantity($quantity)
    {
        $this->increment('quantity', $quantity);
    }
}