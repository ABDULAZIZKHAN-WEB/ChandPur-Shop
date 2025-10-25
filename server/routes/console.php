<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Register the Windows storage link command
Artisan::command('storage:link-windows', function () {
    $command = new \App\Console\Commands\StorageLinkWindows();
    return $command->handle();
})->purpose('Create storage link that works on Windows');