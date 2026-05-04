<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\OAuthController;
use App\Http\Controllers\RatingController;
use Illuminate\Support\Facades\Route;

// Health check (unauthenticated)
Route::get('/health', [HealthController::class, 'check'])->withoutMiddleware('throttle:api');

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:20,1');
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
    });
});

// OAuth routes
Route::prefix('oauth')->group(function () {
    Route::get('/{provider}/redirect', [OAuthController::class, 'redirect']);
    Route::get('/{provider}/callback', [OAuthController::class, 'callback']);
});

// Authenticated API routes
Route::middleware('auth:api')->group(function () {
    // Events
    Route::apiResource('events', EventController::class);
    Route::post('/events/{event}/join', [EventController::class, 'join']);
    Route::delete('/events/{event}/leave', [EventController::class, 'leave']);

    // Ratings
    Route::get('/ratings/received', [RatingController::class, 'received']);
    Route::get('/ratings/given', [RatingController::class, 'given']);
    Route::post('/ratings', [RatingController::class, 'store']);
    Route::get('/users/{user}/stats', [RatingController::class, 'userStats']);

    // Chat / Conversations
    Route::get('/conversations', [ChatController::class, 'index']);
    Route::post('/conversations', [ChatController::class, 'store']);
    Route::get('/conversations/{conversation}', [ChatController::class, 'show']);
    Route::post('/conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);
});
