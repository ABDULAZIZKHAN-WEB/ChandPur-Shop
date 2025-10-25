<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\BannerController;
// Admin controllers
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminCouponController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminBannerController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Admin\AdminReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test route to check if API routing is working
Route::get('/test', function() {
    return response()->json(['message' => 'API routing is working']);
});

// Sample data endpoint
Route::get('/sample-data', function() {
    return response()->json([
        'users' => \App\Models\User::count(),
        'categories' => \App\Models\Category::count(),
        'products' => \App\Models\Product::count(),
        'banners' => \App\Models\Banner::count(),
        'coupons' => \App\Models\Coupon::count(),
        'settings' => \App\Models\Setting::count(),
        'featured_products' => \App\Models\Product::where('featured', true)->count(),
        'sample_categories' => \App\Models\Category::whereNull('parent_id')->get(['name', 'slug']),
        'sample_products' => \App\Models\Product::with('category')->take(5)->get(['name', 'price', 'quantity', 'category_id']),
    ]);
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public product routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/category/{slug}', [ProductController::class, 'byCategory']);
Route::get('/reviews/product/{id}', [ReviewController::class, 'byProduct']);
Route::get('/banners', [BannerController::class, 'active']);

// Public coupon validation (no auth required)
Route::post('/coupons/validate', [CouponController::class, 'validate']);

// Protected routes (Sanctum auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Payment
    Route::post('/payment/initiate', [PaymentController::class, 'initiate']);
});

// Payment callbacks (no auth)
Route::post('/payment/success', [PaymentController::class, 'success']);
Route::post('/payment/fail', [PaymentController::class, 'fail']);
Route::post('/payment/cancel', [PaymentController::class, 'cancel']);
Route::post('/payment/ipn', [PaymentController::class, 'ipn']);

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard/statistics', [AdminDashboardController::class, 'statistics']);
    Route::get('/dashboard/recent-orders', [AdminDashboardController::class, 'recentOrders']);
    Route::get('/dashboard/top-products', [AdminDashboardController::class, 'topProducts']);
    Route::get('/dashboard/sales-chart', [AdminDashboardController::class, 'salesChart']);
    Route::get('/dashboard/low-stock', [AdminDashboardController::class, 'lowStock']);

    // Categories
    Route::apiResource('categories', AdminCategoryController::class);
    // Additional route to handle POST requests with FormData for updates
    Route::post('/categories/{id}', [AdminCategoryController::class, 'updatePost']);
    Route::post('/categories/reorder', [AdminCategoryController::class, 'reorder']);

    // Products
    Route::apiResource('products', AdminProductController::class);
    Route::get('/products/low-stock', [AdminProductController::class, 'lowStock']);
    Route::get('/products/out-of-stock', [AdminProductController::class, 'outOfStock']);
    Route::post('/products/{id}/gallery', [AdminProductController::class, 'uploadGallery']);
    Route::delete('/products/{id}/gallery/{image}', [AdminProductController::class, 'deleteGalleryImage']);
    Route::post('/products/import', [AdminProductController::class, 'import']);
    Route::get('/products/export', [AdminProductController::class, 'export']);
    
    // Product Attributes
    Route::get('/products/{id}/attributes', [AdminProductController::class, 'getAttributes']);
    Route::post('/products/{id}/attributes', [AdminProductController::class, 'storeAttribute']);
    Route::put('/products/{id}/attributes/{attributeId}', [AdminProductController::class, 'updateAttribute']);
    Route::delete('/products/{id}/attributes/{attributeId}', [AdminProductController::class, 'deleteAttribute']);

    // Orders
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/notes', [AdminOrderController::class, 'addNote']);
    Route::get('/orders/{id}/invoice', [AdminOrderController::class, 'generateInvoice']);
    Route::get('/orders/export', [AdminOrderController::class, 'export']);

    // Coupons
    Route::apiResource('coupons', AdminCouponController::class);
    Route::get('/coupons/{id}/usage', [AdminCouponController::class, 'usage']);

    // Users
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
    Route::patch('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
    Route::get('/users/{id}/orders', [AdminUserController::class, 'orders']);

    // Reviews
    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::patch('/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
    Route::patch('/reviews/{id}/reject', [AdminReviewController::class, 'reject']);
    Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

    // Banners
    Route::apiResource('banners', AdminBannerController::class);
    // Additional route to handle POST requests with FormData for updates
    Route::post('/banners/{id}', [AdminBannerController::class, 'updatePost']);
    Route::post('/banners/reorder', [AdminBannerController::class, 'reorder']);

    // Settings
    Route::get('/settings', [AdminSettingController::class, 'index']);
    Route::post('/settings', [AdminSettingController::class, 'update']);

    // Reports
    Route::get('/reports/sales', [AdminReportController::class, 'sales']);
    Route::get('/reports/products', [AdminReportController::class, 'products']);
    Route::get('/reports/customers', [AdminReportController::class, 'customers']);
    Route::get('/reports/inventory', [AdminReportController::class, 'inventory']);
});