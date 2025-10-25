<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'link',
        'position',
        'status',
        'sort_order',
        'clicks',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'clicks' => 'integer',
    ];

    // Ensure these attributes are appended to JSON responses
    protected $appends = [
        'image_url'
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    // Accessors
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    // Methods
    public function incrementClicks()
    {
        $this->increment('clicks');
    }
}