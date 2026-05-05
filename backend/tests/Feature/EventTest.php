<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventTest extends TestCase
{
    use RefreshDatabase;

    // ── List Events ───────────────────────────────────────────────────────────

    public function test_can_list_active_events(): void
    {
        $user = User::factory()->create();
        Event::factory()->count(3)->create(['organizer_id' => $user->id]);
        Event::factory()->cancelled()->create(['organizer_id' => $user->id]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/events')
            ->assertOk()
            ->assertJsonCount(3);
    }

    public function test_can_filter_events_by_sport(): void
    {
        $user = User::factory()->create();
        Event::factory()->create(['organizer_id' => $user->id, 'sport' => 'tennis']);
        Event::factory()->create(['organizer_id' => $user->id, 'sport' => 'football']);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/events?sport=tennis')
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_can_filter_events_by_city(): void
    {
        $user = User::factory()->create();
        Event::factory()->create(['organizer_id' => $user->id, 'city' => 'Curitiba']);
        Event::factory()->create(['organizer_id' => $user->id, 'city' => 'São Paulo']);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/events?city=Curitiba')
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_list_events_requires_authentication(): void
    {
        $this->getJson('/api/v1/events')->assertStatus(401);
    }

    // ── Create Event ──────────────────────────────────────────────────────────

    public function test_authenticated_user_can_create_event(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/events', [
                'title'      => 'Football match',
                'sport'      => 'football',
                'city'       => 'Curitiba',
                'date_start' => now()->addDay()->format('Y-m-d H:i:s'),
                'date_end'   => now()->addDays(2)->format('Y-m-d H:i:s'),
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['title' => 'Football match', 'sport' => 'football']);

        $this->assertDatabaseHas('events', [
            'title'        => 'Football match',
            'organizer_id' => $user->id,
        ]);
    }

    public function test_create_event_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/events', [])
            ->assertStatus(422);
    }

    public function test_create_event_requires_end_after_start(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/events', [
                'title'      => 'Bad Dates',
                'sport'      => 'tennis',
                'city'       => 'Curitiba',
                'date_start' => now()->addDays(5)->format('Y-m-d H:i:s'),
                'date_end'   => now()->addDays(2)->format('Y-m-d H:i:s'),
            ])
            ->assertStatus(422);
    }

    // ── Show Event ────────────────────────────────────────────────────────────

    public function test_can_get_single_event(): void
    {
        $user  = User::factory()->create();
        $event = Event::factory()->create(['organizer_id' => $user->id]);

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/events/{$event->id}")
            ->assertOk()
            ->assertJsonFragment(['id' => $event->id]);
    }

    // ── Update Event ──────────────────────────────────────────────────────────

    public function test_organizer_can_update_event(): void
    {
        $user  = User::factory()->create();
        $event = Event::factory()->create(['organizer_id' => $user->id]);

        $this->actingAs($user, 'api')
            ->putJson("/api/v1/events/{$event->id}", [
                'title' => 'Updated Title',
            ])
            ->assertOk()
            ->assertJsonFragment(['title' => 'Updated Title']);
    }

    public function test_non_organizer_cannot_update_event(): void
    {
        $organizer = User::factory()->create();
        $other     = User::factory()->create();
        $event     = Event::factory()->create(['organizer_id' => $organizer->id]);

        $this->actingAs($other, 'api')
            ->putJson("/api/v1/events/{$event->id}", ['title' => 'Hack'])
            ->assertStatus(403);
    }

    // ── Delete Event ──────────────────────────────────────────────────────────

    public function test_organizer_can_delete_event(): void
    {
        $user  = User::factory()->create();
        $event = Event::factory()->create(['organizer_id' => $user->id]);

        $this->actingAs($user, 'api')
            ->deleteJson("/api/v1/events/{$event->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    public function test_non_organizer_cannot_delete_event(): void
    {
        $organizer = User::factory()->create();
        $other     = User::factory()->create();
        $event     = Event::factory()->create(['organizer_id' => $organizer->id]);

        $this->actingAs($other, 'api')
            ->deleteJson("/api/v1/events/{$event->id}")
            ->assertStatus(403);
    }

    // ── Join Event ────────────────────────────────────────────────────────────

    public function test_user_can_join_active_event(): void
    {
        $organizer = User::factory()->create();
        $joiner    = User::factory()->create();
        $event     = Event::factory()->create(['organizer_id' => $organizer->id]);

        $this->actingAs($joiner, 'api')
            ->postJson("/api/v1/events/{$event->id}/join")
            ->assertOk();

        $this->assertDatabaseHas('event_participants', [
            'user_id'  => $joiner->id,
            'event_id' => $event->id,
        ]);
    }

    public function test_user_cannot_join_same_event_twice(): void
    {
        $user  = User::factory()->create();
        $event = Event::factory()->create();

        EventParticipant::factory()->create([
            'user_id'  => $user->id,
            'event_id' => $event->id,
        ]);

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/events/{$event->id}/join")
            ->assertStatus(400);
    }

    public function test_user_cannot_join_cancelled_event(): void
    {
        $user  = User::factory()->create();
        $event = Event::factory()->cancelled()->create();

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/events/{$event->id}/join")
            ->assertStatus(400);
    }

    public function test_user_cannot_join_full_event(): void
    {
        $organizer = User::factory()->create();
        $joiner    = User::factory()->create();
        $event     = Event::factory()->withCapacity(1)->create(['organizer_id' => $organizer->id]);

        // Fill the capacity
        EventParticipant::factory()->create([
            'event_id' => $event->id,
            'user_id'  => User::factory()->create()->id,
        ]);

        $this->actingAs($joiner, 'api')
            ->postJson("/api/v1/events/{$event->id}/join")
            ->assertStatus(400)
            ->assertJsonFragment(['message' => 'Event is full.']);
    }

    // ── Leave Event ───────────────────────────────────────────────────────────

    public function test_participant_can_leave_event(): void
    {
        $user  = User::factory()->create();
        $event = Event::factory()->create();

        EventParticipant::factory()->create([
            'user_id'  => $user->id,
            'event_id' => $event->id,
        ]);

        $this->actingAs($user, 'api')
            ->deleteJson("/api/v1/events/{$event->id}/leave")
            ->assertStatus(204);

        $this->assertDatabaseMissing('event_participants', [
            'user_id'  => $user->id,
            'event_id' => $event->id,
        ]);
    }

    public function test_non_participant_cannot_leave_event(): void
    {
        $user  = User::factory()->create();
        $event = Event::factory()->create();

        $this->actingAs($user, 'api')
            ->deleteJson("/api/v1/events/{$event->id}/leave")
            ->assertStatus(404);
    }
}
