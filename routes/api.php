<?php

use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\PublicAssetController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:60,1')->get('/public/assets/{token}', [PublicAssetController::class, 'show']);
Route::middleware('throttle:60,1')->get('/public/assets/{token}/inspections', [PublicAssetController::class, 'inspections']);

Route::middleware(['web', 'throttle:10,1'])->post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware(['web', 'auth']);
Route::get('/me', [AuthController::class, 'me'])->middleware(['web', 'auth']);

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/assets/by-token/{token}', [AssetController::class, 'byToken']);
    Route::get('/assets', [AssetController::class, 'index']);
    Route::post('/assets', [AssetController::class, 'store']);
    Route::delete('/assets/{asset}', [AssetController::class, 'destroy']);
    Route::post('/assets/{asset}/restore', [AssetController::class, 'restore']);
    Route::post('/assets/{asset}/resolve', [AssetController::class, 'resolve']);
    Route::post('/assets/{asset}/reset-token', [AssetController::class, 'resetToken']);
    Route::get('/assets/{asset}/label', [AssetController::class, 'label']);
    Route::post('/inspections', [InspectionController::class, 'store']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::match(['get', 'post'], '/areas', [MasterController::class, 'areas']);
    Route::delete('/areas/{area}', [MasterController::class, 'deleteArea']);
    Route::match(['get', 'post'], '/asset-types', [MasterController::class, 'assetTypes']);
    Route::match(['get', 'post'], '/checklist-items', [MasterController::class, 'checklist']);
    Route::put('/checklist-items/{checklistItem}', [MasterController::class, 'updateChecklistItem']);
    Route::delete('/checklist-items/{checklistItem}', [MasterController::class, 'deleteChecklistItem']);
    Route::match(['get', 'post'], '/users', [MasterController::class, 'users']);
    Route::put('/users/{user}', [MasterController::class, 'updateUser']);
    Route::delete('/users/{user}', [MasterController::class, 'deleteUser']);
});
