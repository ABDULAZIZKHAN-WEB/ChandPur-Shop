<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class StorageService
{
    /**
     * Sync a file from storage/app/public to public/storage
     * This is needed for Windows environments where symlinks don't work properly
     */
    public static function syncFileToPublic($relativePath)
    {
        $sourcePath = storage_path('app/public/' . $relativePath);
        $destinationPath = public_path('storage/' . $relativePath);
        
        // Create destination directory if it doesn't exist
        $destinationDir = dirname($destinationPath);
        if (!File::exists($destinationDir)) {
            File::makeDirectory($destinationDir, 0755, true);
        }
        
        // Copy the file
        if (File::exists($sourcePath)) {
            File::copy($sourcePath, $destinationPath);
            Log::info("File synced to public storage: $relativePath");
            return true;
        }
        
        Log::warning("Source file not found for sync: $sourcePath");
        return false;
    }
    
    /**
     * Delete a file from both storage/app/public and public/storage
     */
    public static function deleteFile($relativePath)
    {
        $sourcePath = storage_path('app/public/' . $relativePath);
        $publicPath = public_path('storage/' . $relativePath);
        
        $deleted = false;
        
        if (File::exists($sourcePath)) {
            File::delete($sourcePath);
            $deleted = true;
        }
        
        if (File::exists($publicPath)) {
            File::delete($publicPath);
            $deleted = true;
        }
        
        if ($deleted) {
            Log::info("File deleted from storage: $relativePath");
        }
        
        return $deleted;
    }
    
    /**
     * Sync entire storage directory to public
     */
    public static function syncAllToPublic()
    {
        $sourceDir = storage_path('app/public');
        $destinationDir = public_path('storage');
        
        // Remove existing public/storage directory
        if (File::exists($destinationDir)) {
            File::deleteDirectory($destinationDir);
        }
        
        // Copy entire directory
        File::copyDirectory($sourceDir, $destinationDir);
        
        Log::info("All storage files synced to public directory");
        return true;
    }
    
    /**
     * Check if storage link is working properly
     */
    public static function isStorageLinkWorking()
    {
        // Create a test file in storage
        $testFile = 'test-' . time() . '.txt';
        $testContent = 'Storage link test';
        
        $storagePath = storage_path('app/public/' . $testFile);
        $publicPath = public_path('storage/' . $testFile);
        
        // Write test file to storage
        File::put($storagePath, $testContent);
        
        // Check if it's accessible via public path
        $isWorking = File::exists($publicPath) && File::get($publicPath) === $testContent;
        
        // Clean up test file
        File::delete($storagePath);
        if (File::exists($publicPath)) {
            File::delete($publicPath);
        }
        
        return $isWorking;
    }
}