<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    public function definition(): array
    {
        $dateStart = fake()->dateTimeBetween('+1 day', '+30 days');
        $dateEnd   = fake()->dateTimeBetween($dateStart, '+31 days');

        return [
            'title'            => fake()->sentence(4),
            'description'      => fake()->paragraph(),
            'sport'            => fake()->randomElement(['football', 'basketball', 'tennis', 'volleyball']),
            'location'         => fake()->streetAddress(),
            'city'             => fake()->city(),
            'date_start'       => $dateStart,
            'date_end'         => $dateEnd,
            'organizer_id'     => User::factory(),
            'max_participants' => null,
            'status'           => 'active',
        ];
    }

    public function past(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_start' => fake()->dateTimeBetween('-30 days', '-2 days'),
            'date_end'   => fake()->dateTimeBetween('-1 day', 'now'),
        ]);
    }

    public function withCapacity(int $max): static
    {
        return $this->state(fn (array $attributes) => [
            'max_participants' => $max,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }
}
