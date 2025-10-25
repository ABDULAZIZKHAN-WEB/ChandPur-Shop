<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'subtotal',
        'tax',
        'shipping_cost',
        'discount',
        'total',
        'payment_method',
        'payment_status',
        'order_status',
        'currency',
        'shipping_address',
        'billing_address',
        'transaction_id',
        'notes',
        'status_history', // Add this for status tracking
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'status_history' => 'array', // Cast status history as array
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('order_status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('order_status', 'processing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('order_status', 'delivered');
    }

    // Accessors
    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => 'warning',
            'processing' => 'info',
            'shipped' => 'primary',
            'delivered' => 'success',
            'cancelled' => 'danger',
        ];

        return $badges[$this->order_status] ?? 'secondary';
    }

    public function getPaymentStatusBadgeAttribute()
    {
        $badges = [
            'pending' => 'warning',
            'paid' => 'success',
            'failed' => 'danger',
            'refunded' => 'info',
        ];

        return $badges[$this->payment_status] ?? 'secondary';
    }

    // Methods
    public function updateStatus($status)
    {
        try {
            // Get current status history or initialize empty array
            $statusHistory = $this->status_history ?? [];
            
            // Add new status to history
            $statusHistory[] = [
                'status' => $status,
                'timestamp' => now()->toISOString(),
                'user_id' => auth()->check() ? auth()->id() : null,
            ];
            
            // Update the order with new status and history
            $this->update([
                'order_status' => $status,
                'status_history' => $statusHistory
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to update order status in model', [
                'order_id' => $this->id,
                'status' => $status,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    public function updatePaymentStatus($status)
    {
        $this->update(['payment_status' => $status]);
    }

    public function addNote($note, $userId = null)
    {
        $notes = $this->notes ? $this->notes . "\n\n" . $note : $note;
        $this->update(['notes' => $notes]);
        
        // Also add to status history as a note
        $statusHistory = $this->status_history ?? [];
        $statusHistory[] = [
            'type' => 'note',
            'note' => $note,
            'timestamp' => now()->toISOString(),
            'user_id' => $userId ?? (auth()->check() ? auth()->id() : null),
        ];
        
        $this->update(['status_history' => $statusHistory]);
    }

    public function getStatusHistory()
    {
        return $this->status_history ?? [];
    }

    public static function generateOrderNumber()
    {
        return 'ORD-' . date('Y') . '-' . str_pad(static::count() + 1, 6, '0', STR_PAD_LEFT);
    }
}