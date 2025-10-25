<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Order::with(['user:id,name,email']);

            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('order_number', 'like', '%' . $request->search . '%')
                      ->orWhereHas('user', function ($userQuery) use ($request) {
                          $userQuery->where('name', 'like', '%' . $request->search . '%')
                                   ->orWhere('email', 'like', '%' . $request->search . '%');
                      });
                });
            }

            if ($request->filled('order_status')) {
                $query->where('order_status', $request->order_status);
            }

            if ($request->filled('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            $orders = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch orders',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::with(['user', 'items.product'])->findOrFail($id);
            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Order not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            // Log the incoming request data for debugging
            \Log::info('Update order status request', [
                'order_id' => $id,
                'request_data' => $request->all(),
                'content_type' => $request->header('Content-Type')
            ]);

            $request->validate([
                'order_status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            ]);

            $order = Order::findOrFail($id);
            
            // Log the order before updating
            \Log::info('Order found for status update', [
                'order_id' => $order->id,
                'current_status' => $order->order_status
            ]);

            $order->updateStatus($request->order_status);

            // Reload the order to get updated data
            $order->refresh();

            return response()->json([
                'message' => 'Order status updated successfully',
                'order' => $order
            ]);
        } catch (ValidationException $e) {
            \Log::error('Validation failed when updating order status', [
                'order_id' => $id,
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'error' => 'Validation failed',
                'message' => 'Invalid order status provided',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to update order status', [
                'order_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'error' => 'Failed to update order status',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    public function addNote(Request $request, $id)
    {
        try {
            $request->validate([
                'note' => 'required|string|max:1000',
            ]);

            $order = Order::findOrFail($id);
            $order->addNote($request->note, auth()->id());

            return response()->json([
                'message' => 'Note added successfully',
                'order' => $order
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => 'Invalid note provided',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to add note',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    public function export()
    {
        try {
            $orders = Order::with(['user'])->get();

            $csv = "Order Number,Customer,Email,Total,Status,Payment Status,Created At\n";
            foreach ($orders as $order) {
                $csv .= sprintf(
                    '"%s","%s","%s",%s,"%s","%s","%s"' . "\n",
                    $order->order_number,
                    $order->user->name ?? 'N/A',
                    $order->user->email ?? 'N/A',
                    $order->total,
                    $order->order_status,
                    $order->payment_status,
                    $order->created_at->format('Y-m-d H:i:s')
                );
            }

            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="orders-' . date('Y-m-d') . '.csv"');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to export orders',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }
}