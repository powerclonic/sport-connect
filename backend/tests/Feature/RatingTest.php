<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RatingTest extends TestCase
{
    use RefreshDatabase;

    // ── Received Ratings ──────────────────────────────────────────────────────

    public function test_user_can_list_ratings_received(): void
    {
        $user  = User::factory()->create();
        $rater = User::factory()->create();
        $event = Event::factory()->past()->create();

        Rating::factory()->create([
            'ratee_id' => $user->id,
            'rater_id' => $rater->id,
            'event_id' => $event->id,
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/v1/ratings/received');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['ratee_id' => $user->id]);
    }

    public function test_received_ratings_requires_authentication(): void
    {
        $this->getJson('/api/v1/ratings/received')->assertStatus(401);
    }

    // ── Given Ratings ─────────────────────────────────────────────────────────

    public function test_user_can_list_ratings_given(): void
    {
        $rater = User::factory()->create();
        $ratee = User::factory()->create();
        $event = Event::factory()->past()->create();

        Rating::factory()->create([
            'rater_id' => $rater->id,
            'ratee_id' => $ratee->id,
            'event_id' => $event->id,
        ]);

        $response = $this->actingAs($rater, 'api')
            ->getJson('/api/v1/ratings/given');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['rater_id' => $rater->id]);
    }

    // ── Submit Rating ─────────────────────────────────────────────────────────

    public function test_participant_can_rate_another_participant(): void
    {
        $rater = User::factory()->create();
        $ratee = User::factory()->create();
        $event = Event::factory()->past()->create();

        EventParticipant::factory()->create(['user_id' => $rater->id, 'event_id' => $event->id]);
        EventParticipant::factory()->create(['user_id' => $ratee->id, 'event_id' => $event->id]);

        $response = $this->actingAs($rater, 'api')
            ->postJson('/api/v1/ratings', [
                'event_id' => $event->id,
                'ratee_id' => $ratee->id,
                'score'    => 4.5,
                'comment'  => 'Great player!',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['score' => 4.5]);
    }

    public function test_user_cannot_rate_themselves(): void
    {
        $user  = User::factory()->create();
        $event = Event::factory()->past()->create();

        EventParticipant::factory()->create(['user_id' => $user->id, 'event_id' => $event->id]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/ratings', [
                'event_id' => $event->id,
                'ratee_id' => $user->id,
                'score'    => 5,
            ])
            ->assertStatus(400)
            ->assertJsonFragment(['message' => 'Cannot rate yourself.']);
    }

    public function test_cannot_rate_for_future_event(): void
    {
        $rater = User::factory()->create();
        $ratee = User::factory()->create();
        $event = Event::factory()->create(); // future event by default

        EventParticipant::factory()->create(['user_id' => $rater->id, 'event_id' => $event->id]);
        EventParticipant::factory()->create(['user_id' => $ratee->id, 'event_id' => $event->id]);

        $this->actingAs($rater, 'api')
            ->postJson('/api/v1/ratings', [
                'event_id' => $event->id,
                'ratee_id' => $ratee->id,
                'score'    => 3,
            ])
            ->assertStatus(400)
            ->assertJsonFragment(['message' => 'Event has not ended yet.']);
    }

    public function test_non_participant_cannot_rate(): void
    {
        $outsider = User::factory()->create();
        $ratee    = User::factory()->create();
        $event    = Event::factory()->past()->create();

        EventParticipant::factory()->create(['user_id' => $ratee->id, 'event_id' => $event->id]);

        $this->actingAs($outsider, 'api')
            ->postJson('/api/v1/ratings', [
                'event_id' => $event->id,
                'ratee_id' => $ratee->id,
                'score'    => 3,
            ])
            ->assertStatus(400)
            ->assertJsonFragment(['message' => 'You must be a participant in the event to rate.']);
    }

    public function test_cannot_rate_non_participant(): void
    {
        $rater    = User::factory()->create();
        $outsider = User::factory()->create();
        $event    = Event::factory()->past()->create();

        EventParticipant::factory()->create(['user_id' => $rater->id, 'event_id' => $event->id]);

        $this->actingAs($rater, 'api')
            ->postJson('/api/v1/ratings', [
                'event_id' => $event->id,
                'ratee_id' => $outsider->id,
                'score'    => 3,
            ])
            ->assertStatus(400)
            ->assertJsonFragment(['message' => 'Ratee must be a participant in the event.']);
    }

    public function test_cannot_rate_same_user_twice_for_same_event(): void
    {
        $rater = User::factory()->create();
        $ratee = User::factory()->create();
        $event = Event::factory()->past()->create();

        EventParticipant::factory()->create(['user_id' => $rater->id, 'event_id' => $event->id]);
        EventParticipant::factory()->create(['user_id' => $ratee->id, 'event_id' => $event->id]);

        Rating::factory()->create([
            'rater_id' => $rater->id,
            'ratee_id' => $ratee->id,
            'event_id' => $event->id,
        ]);

        $this->actingAs($rater, 'api')
            ->postJson('/api/v1/ratings', [
                'event_id' => $event->id,
                'ratee_id' => $ratee->id,
                'score'    => 4,
            ])
            ->assertStatus(400)
            ->assertJsonFragment(['message' => 'Already rated this user for this event.']);
    }

    // ── User Stats ────────────────────────────────────────────────────────────

    public function test_can_get_user_stats(): void
    {
        $viewer = User::factory()->create();
        $target = User::factory()->create();
        $event  = Event::factory()->past()->create();

        EventParticipant::factory()->create(['user_id' => $target->id, 'event_id' => $event->id]);
        Rating::factory()->create(['ratee_id' => $target->id, 'score' => 4.0]);
        Rating::factory()->create(['ratee_id' => $target->id, 'score' => 2.0]);

        $response = $this->actingAs($viewer, 'api')
            ->getJson("/api/v1/users/{$target->id}/stats");

        $response->assertOk()
            ->assertJsonStructure(['games_played', 'average_rating', 'reliability'])
            ->assertJsonFragment(['average_rating' => 3.0]);
    }
}
