<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\OrderItem;
use App\Models\Category;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function statistics()
    {
        try {
            $today = Carbon::today();
            $thisWeek = Carbon::now()->startOfWeek();
            $thisMonth = Carbon::now()->startOfMonth();
            $lastMonth = Carbon::now()->subMonth()->startOfMonth();

            // Revenue statistics
            $todayRevenue = Order::whereDate('created_at', $today)
                ->where('payment_status', 'paid')
                ->sum('total');

            $weekRevenue = Order::where('created_at', '>=', $thisWeek)
                ->where('payment_status', 'paid')
                ->sum('total');

            $monthRevenue = Order::where('created_at', '>=', $thisMonth)
                ->where('payment_status', 'paid')
                ->sum('total');

            $lastMonthRevenue = Order::whereBetween('created_at', [$lastMonth, $thisMonth])
                ->where('payment_status', 'paid')
                ->sum('total');

            $totalRevenue = Order::where('payment_status', 'paid')->sum('total');

            // Order statistics
            $totalOrders = Order::count();
            $pendingOrders = Order::where('order_status', 'pending')->count();
            $processingOrders = Order::where('order_status', 'processing')->count();
            $shippedOrders = Order::where('order_status', 'shipped')->count();
            $completedOrders = Order::where('order_status', 'delivered')->count();
            $cancelledOrders = Order::where('order_status', 'cancelled')->count();

            // Product statistics
            $totalProducts = Product::count();
            $activeProducts = Product::where('status', 'active')->count();
            $outOfStockProducts = Product::where('quantity', '<=', 0)->count();
            $lowStockProducts = Product::where('quantity', '>', 0)
                ->where('quantity', '<=', 10)
                ->count();

            // User statistics
            $totalUsers = User::where('role', 'customer')->count();
            $activeUsers = User::where('role', 'customer')
                ->where('status', 'active')
                ->count();
            $newUsersThisMonth = User::where('role', 'customer')
                ->where('created_at', '>=', $thisMonth)
                ->count();

            return response()->json([
                'revenue' => [
                    'today' => $todayRevenue,
                    'week' => $weekRevenue,
                    'month' => $monthRevenue,
                    'last_month' => $lastMonthRevenue,
                    'total' => $totalRevenue,
                    'growth_percentage' => $lastMonthRevenue > 0 
                        ? round((($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 2)
                        : 0,
                ],
                'orders' => [
                    'total' => $totalOrders,
                    'pending' => $pendingOrders,
                    'processing' => $processingOrders,
                    'shipped' => $shippedOrders,
                    'completed' => $completedOrders,
                    'cancelled' => $cancelledOrders,
                ],
                'products' => [
                    'total' => $totalProducts,
                    'active' => $activeProducts,
                    'out_of_stock' => $outOfStockProducts,
                    'low_stock' => $lowStockProducts,
                ],
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'new_this_month' => $newUsersThisMonth,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function recentOrders()
    {
        try {
            $orders = Order::with(['user:id,name,email'])
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch recent orders',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function topProducts()
    {
        try {
            // Fixed the query to properly group results
            $products = Product::select(
                'products.id',
                'products.name',
                'products.price',
                'products.image',
                'products.sku',
                DB::raw('COALESCE(SUM(order_items.quantity), 0) as total_sold')
            )
            ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
            ->groupBy(
                'products.id',
                'products.name',
                'products.price',
                'products.image',
                'products.sku'
            )
            ->orderBy('total_sold', 'desc')
            ->take(10)
            ->get();

            return response()->json($products);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch top products: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch top products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function salesChart(Request $request)
    {
        try {
            $period = $request->get('period', 'week'); // day, week, month, year

            $query = Order::where('payment_status', 'paid');

            switch ($period) {
                case 'day':
                    $query->selectRaw('DATE(created_at) as date, SUM(total) as total')
                        ->where('created_at', '>=', Carbon::now()->subDays(7))
                        ->groupBy('date');
                    break;
                case 'week':
                    $query->selectRaw('YEARWEEK(created_at) as period, SUM(total) as total')
                        ->where('created_at', '>=', Carbon::now()->subWeeks(12))
                        ->groupBy('period');
                    break;
                case 'month':
                    $query->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as period, SUM(total) as total')
                        ->where('created_at', '>=', Carbon::now()->subMonths(12))
                        ->groupBy('period');
                    break;
                case 'year':
                    $query->selectRaw('YEAR(created_at) as period, SUM(total) as total')
                        ->where('created_at', '>=', Carbon::now()->subYears(5))
                        ->groupBy('period');
                    break;
            }

            $data = $query->orderBy('period')->get();

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch sales chart data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function lowStock()
    {
        try {
            $products = Product::with('category')
                ->where('quantity', '<=', 10)
                ->where('track_quantity', true)
                ->orderBy('quantity')
                ->take(20)
                ->get();

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch low stock products',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}