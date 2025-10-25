<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function sales(Request $request)
    {
        try {
            // Handle empty date parameters
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            
            // Set default dates if not provided or empty
            if (empty($startDate)) {
                $startDate = Carbon::now()->subDays(30);
            } else {
                $startDate = Carbon::parse($startDate);
            }
            
            if (empty($endDate)) {
                $endDate = Carbon::now();
            } else {
                $endDate = Carbon::parse($endDate);
            }
            
            $period = $request->get('period', 'day'); // day, week, month

            $query = Order::where('payment_status', 'paid')
                ->whereBetween('created_at', [$startDate, $endDate]);

            // Sales over time
            $salesData = $this->getSalesData($query, $period);

            // Summary statistics
            $totalRevenue = $query->sum('total');
            $totalOrders = $query->count();
            $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

            // Top selling products
            $topProducts = OrderItem::select('product_id', 'product_name')
                ->selectRaw('SUM(quantity) as total_sold, SUM(total) as revenue')
                ->whereHas('order', function ($q) use ($startDate, $endDate) {
                    $q->where('payment_status', 'paid')
                      ->whereBetween('created_at', [$startDate, $endDate]);
                })
                ->groupBy('product_id', 'product_name')
                ->orderBy('total_sold', 'desc')
                ->take(10)
                ->get();

            return response()->json([
                'sales_data' => $salesData,
                'summary' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrders,
                    'average_order_value' => round($averageOrderValue, 2),
                ],
                'top_products' => $topProducts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate sales report',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    public function products(Request $request)
    {
        try {
            // Handle empty date parameters
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            
            // Set default dates if not provided or empty
            if (empty($startDate)) {
                $startDate = Carbon::now()->subDays(30);
            } else {
                $startDate = Carbon::parse($startDate);
            }
            
            if (empty($endDate)) {
                $endDate = Carbon::now();
            } else {
                $endDate = Carbon::parse($endDate);
            }

            // Product performance
            $products = Product::select('products.*')
                ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
                ->leftJoin('orders', function ($join) use ($startDate, $endDate) {
                    $join->on('order_items.order_id', '=', 'orders.id')
                         ->where('orders.payment_status', 'paid')
                         ->whereBetween('orders.created_at', [$startDate, $endDate]);
                })
                ->selectRaw('COALESCE(SUM(order_items.quantity), 0) as total_sold')
                ->selectRaw('COALESCE(SUM(order_items.total), 0) as revenue')
                ->groupBy('products.id')
                ->orderBy('total_sold', 'desc')
                ->paginate(20);

            // Low stock products
            $lowStockProducts = Product::where('quantity', '<=', 10)
                ->where('track_quantity', true)
                ->orderBy('quantity')
                ->take(20)
                ->get();

            // Out of stock products
            $outOfStockProducts = Product::where('quantity', '<=', 0)
                ->where('track_quantity', true)
                ->count();

            return response()->json([
                'products' => $products,
                'low_stock_products' => $lowStockProducts,
                'out_of_stock_count' => $outOfStockProducts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate products report',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    public function customers(Request $request)
    {
        try {
            // Handle empty date parameters
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            
            // Set default dates if not provided or empty
            if (empty($startDate)) {
                $startDate = Carbon::now()->subDays(30);
            } else {
                $startDate = Carbon::parse($startDate);
            }
            
            if (empty($endDate)) {
                $endDate = Carbon::now();
            } else {
                $endDate = Carbon::parse($endDate);
            }

            // Customer statistics
            $totalCustomers = User::where('role', 'customer')->count();
            $newCustomers = User::where('role', 'customer')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            // Top customers by orders
            $topCustomers = User::select('users.*')
                ->selectRaw('COUNT(orders.id) as total_orders')
                ->selectRaw('COALESCE(SUM(orders.total), 0) as total_spent')
                ->leftJoin('orders', function ($join) use ($startDate, $endDate) {
                    $join->on('users.id', '=', 'orders.user_id')
                         ->where('orders.payment_status', 'paid')
                         ->whereBetween('orders.created_at', [$startDate, $endDate]);
                })
                ->where('users.role', 'customer')
                ->groupBy('users.id')
                ->orderBy('total_spent', 'desc')
                ->take(20)
                ->get();

            // Customer registration over time
            $registrationData = User::where('role', 'customer')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json([
                'summary' => [
                    'total_customers' => $totalCustomers,
                    'new_customers' => $newCustomers,
                ],
                'top_customers' => $topCustomers,
                'registration_data' => $registrationData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate customers report',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    // New inventory report method
    public function inventory(Request $request)
    {
        try {
            // Total products
            $totalProducts = Product::count();

            // Tracked products
            $trackedProducts = Product::where('track_quantity', true)->count();

            // Low stock products (quantity <= 10)
            $lowStockCount = Product::where('quantity', '<=', 10)
                ->where('track_quantity', true)
                ->count();

            // Out of stock products (quantity <= 0)
            $outOfStockCount = Product::where('quantity', '<=', 0)
                ->where('track_quantity', true)
                ->count();

            // Products by status
            $productsByStatus = Product::select('status')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('status')
                ->get();

            return response()->json([
                'total_products' => $totalProducts,
                'tracked_products' => $trackedProducts,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'products_by_status' => $productsByStatus,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate inventory report',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    private function getSalesData($query, $period)
    {
        switch ($period) {
            case 'day':
                return $query->selectRaw('DATE(created_at) as period, SUM(total) as total, COUNT(*) as orders')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
            case 'week':
                return $query->selectRaw('YEARWEEK(created_at) as period, SUM(total) as total, COUNT(*) as orders')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
            case 'month':
                return $query->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as period, SUM(total) as total, COUNT(*) as orders')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
            default:
                return $query->selectRaw('DATE(created_at) as period, SUM(total) as total, COUNT(*) as orders')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
        }
    }
}