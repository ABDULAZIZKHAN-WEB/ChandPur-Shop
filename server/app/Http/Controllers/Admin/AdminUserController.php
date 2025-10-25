<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = User::query();

            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
                });
            }

            if ($request->filled('role')) {
                $query->where('role', $request->role);
            }

            $users = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch users',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = User::with(['orders' => function ($query) {
                $query->orderBy('created_at', 'desc')->take(5);
            }])->findOrFail($id);
            
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'User not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'role' => 'required|in:customer,admin',
            ]);

            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => $request->role,
                'is_admin' => $request->role === 'admin',
            ]);

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update user',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);

            // Prevent deleting admin users
            if ($user->is_admin) {
                return response()->json([
                    'message' => 'Cannot delete admin users'
                ], 400);
            }

            // Check if user has orders
            if ($user->orders()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete user with existing orders'
                ], 400);
            }

            $user->delete();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete user',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            $newStatus = $user->status === 'active' ? 'inactive' : 'active';
            $user->update(['status' => $newStatus]);

            return response()->json([
                'message' => 'User status updated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update user status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function orders($id)
    {
        try {
            $user = User::findOrFail($id);
            $orders = $user->orders()->with(['items.product'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch user orders',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}