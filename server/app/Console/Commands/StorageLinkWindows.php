<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class StorageLinkWindows extends Command
{
    protected $signature = 'storage:link-windows';
    protected $description = 'Create storage link that works on Windows';

    public function handle()
    {
        $publicStoragePath = public_path('storage');
        $storageAppPublicPath = storage_path('app/public');

        // Remove existing link/directory
        if (File::exists($publicStoragePath)) {
            if (is_link($publicStoragePath)) {
                unlink($publicStoragePath);
            } else {
                File::deleteDirectory($publicStoragePath);
            }
        }

        // Try to create junction first (Windows)
        if (PHP_OS_FAMILY === 'Windows') {
            $command = 'mklink /J "' . $publicStoragePath . '" "' . $storageAppPublicPath . '"';
            exec($command, $output, $returnCode);
            
            if ($returnCode === 0) {
                $this->info('Storage junction created successfully.');
                return 0;
            } else {
                $this->warn('Junction creation failed, falling back to copy method.');
            }
        }

        // Fallback: copy directory
        File::copyDirectory($storageAppPublicPath, $publicStoragePath);
        $this->info('Storage directory copied successfully.');
        $this->warn('Note: This is a copy, not a link. You may need to run this command again after uploading new files.');

        return 0;
    }
}