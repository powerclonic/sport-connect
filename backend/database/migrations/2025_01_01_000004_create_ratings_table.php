<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rater_id');
            $table->uuid('ratee_id');
            $table->uuid('event_id');
            $table->float('score'); // 0.0 to 5.0
            $table->text('comment')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('rater_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('ratee_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
            $table->unique(['rater_id', 'ratee_id', 'event_id'], 'ix_ratings_rater_ratee_event');
            $table->index('rater_id', 'ix_ratings_rater_id');
            $table->index('ratee_id', 'ix_ratings_ratee_id');
            $table->index('event_id', 'ix_ratings_event_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
