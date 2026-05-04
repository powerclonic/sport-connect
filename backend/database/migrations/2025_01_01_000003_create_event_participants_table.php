<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('event_id');
            $table->string('status', 20)->default('joined'); // joined, pending, cancelled
            $table->timestampTz('joined_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
            $table->unique(['user_id', 'event_id'], 'ix_event_participants_user_event');
            $table->index('event_id', 'ix_event_participants_event_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_participants');
    }
};
