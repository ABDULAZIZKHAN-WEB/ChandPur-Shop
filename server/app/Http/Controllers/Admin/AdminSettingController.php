<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;

class AdminSettingController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Setting::query();

            if ($request->filled('group')) {
                $query->where('group', $request->group);
            }

            $settings = $query->orderBy('group')->orderBy('key')->get();

            // Group settings by their group
            $groupedSettings = $settings->groupBy('group');

            return response()->json($groupedSettings);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch settings',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            \Log::info('Settings update request received', ['data' => $request->all()]);
            
            $request->validate([
                'settings' => 'required|array',
                'settings.*.key' => 'required|string',
                'settings.*.value' => 'required',
            ]);

            \Log::info('Settings validation passed');

            foreach ($request->settings as $settingData) {
                \Log::info('Updating setting', ['setting' => $settingData]);
                
                Setting::updateOrCreate(
                    ['key' => $settingData['key']],
                    [
                        'value' => $settingData['value'],
                        'group' => $settingData['group'] ?? 'general'
                    ]
                );
            }

            \Log::info('All settings updated successfully');
            
            return response()->json(['message' => 'Settings updated successfully']);
        } catch (ValidationException $e) {
            \Log::error('Settings validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'error' => 'Validation failed',
                'message' => 'Invalid settings data provided',
                'errors' => $e->errors()
            ], 422);
        } catch (QueryException $e) {
            \Log::error('Database error in settings update', ['exception' => $e->getMessage()]);
            return response()->json([
                'error' => 'Database error',
                'message' => 'Failed to update settings in database',
                'details' => config('app.debug') ? $e->getMessage() : 'Database error occurred'
            ], 500);
        } catch (\Exception $e) {
            \Log::error('General error in settings update', ['exception' => $e->getMessage(), 'trace' => $e->getTrace()]);
            return response()->json([
                'error' => 'Failed to update settings',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }
}