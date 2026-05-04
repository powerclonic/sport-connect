<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email', 255)->unique();
            $table->string('password', 255)->nullable(); // null for pure-OAuth users
            $table->string('display_name', 100)->nullable();
            $table->string('avatar_url', 512)->nullable();
            $table->text('bio')->nullable();
            $table->string('location', 150)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->json('sports_preferences')->nullable();
            $table->boolean('profile_complete')->default(false);
            $table->timestamps();

            $table->index(['email', 'is_active'], 'ix_users_email_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
