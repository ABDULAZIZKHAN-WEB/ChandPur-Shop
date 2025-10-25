<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'compare_price',
        'cost_price',
        'sku',
        'barcode',
        'quantity',
        'track_quantity',
        'weight',
        'image',
        'gallery',
        'status',
        'featured',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'quantity' => 'integer',
        'track_quantity' => 'boolean',
        'featured' => 'boolean',
        'gallery' => 'array',
    ];

    // Ensure these attributes are appended to JSON responses
    protected $appends = [
        'is_in_stock',
        'image_url',
        'gallery_urls',
        'average_rating',
        'review_count',
        'discount_percentage'
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews()
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%")
              ->orWhere('sku', 'like', "%{$term}%");
        });
    }

    // Accessors
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function getGalleryUrlsAttribute()
    {
        if (!$this->gallery) {
            return [];
        }

        return collect($this->gallery)->map(function ($image) {
            return asset('storage/' . $image);
        })->toArray();
    }

    public function getAverageRatingAttribute()
    {
        return $this->approvedReviews()->avg('rating') ?: 0;
    }

    public function getReviewCountAttribute()
    {
        return $this->approvedReviews()->count();
    }

    public function getIsInStockAttribute()
    {
        return $this->quantity > 0;
    }

    public function getDiscountPercentageAttribute()
    {
        if (!$this->compare_price || $this->compare_price <= $this->price) {
            return 0;
        }

        return round((($this->compare_price - $this->price) / $this->compare_price) * 100);
    }

    // Methods
    public function decreaseQuantity($quantity)
    {
        if ($this->track_quantity) {
            $this->decrement('quantity', $quantity);
        }
    }

    public function increaseQuantity($quantity)
    {
        if ($this->track_quantity) {
            $this->increment('quantity', $quantity);
        }
    }
}