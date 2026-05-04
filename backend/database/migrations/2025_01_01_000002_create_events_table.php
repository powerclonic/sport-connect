<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('sport', 50)->index();
            $table->string('location', 255)->nullable();
            $table->string('city', 100)->index();
            $table->dateTimeTz('date_start')->index();
            $table->dateTimeTz('date_end');
            $table->uuid('organizer_id');
            $table->integer('max_participants')->nullable();
            $table->string('status', 20)->default('active'); // active, cancelled, completed
            $table->timestamps();

            $table->foreign('organizer_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index('organizer_id', 'ix_events_organizer_id');
            $table->index(['sport', 'city', 'date_start'], 'ix_events_sport_city_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
