<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Rating>
 */
class RatingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'rater_id'   => User::factory(),
            'ratee_id'   => User::factory(),
            'event_id'   => Event::factory()->past(),
            'score'      => fake()->randomFloat(1, 1, 5),
            'comment'    => fake()->optional()->sentence(),
            'created_at' => now(),
        ];
    }
}
