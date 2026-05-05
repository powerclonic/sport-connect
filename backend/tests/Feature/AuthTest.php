<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ── Register ──────────────────────────────────────────────────────────────

    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email'    => 'player@example.com',
            'password' => 'Password1',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['access_token', 'token_type', 'expires_in']);

        $this->assertDatabaseHas('users', ['email' => 'player@example.com']);
    }

    public function test_register_accepts_display_name_and_sports(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email'        => 'sport@example.com',
            'password'     => 'Password1',
            'display_name' => 'SportFan',
            'sports'       => ['football', 'tennis'],
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'sport@example.com')->firstOrFail();
        $this->assertSame('SportFan', $user->display_name);
        $this->assertTrue($user->profile_complete);
        $this->assertContains('football', $user->sports_preferences);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'email'    => 'taken@example.com',
            'password' => 'Password1',
        ])->assertStatus(422);
    }

    public function test_register_rejects_weak_password(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'email'    => 'new@example.com',
            'password' => 'short',
        ])->assertStatus(422);
    }

    public function test_register_rejects_missing_email(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'password' => 'Password1',
        ])->assertStatus(422);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['email' => 'login@example.com']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'login@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['access_token', 'token_type', 'expires_in']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'user@example.com']);

        $this->postJson('/api/v1/auth/login', [
            'email'    => 'user@example.com',
            'password' => 'wrongpassword',
        ])->assertStatus(401);
    }

    public function test_login_fails_with_unknown_email(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email'    => 'nobody@example.com',
            'password' => 'Password1',
        ])->assertStatus(401);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'email'     => 'inactive@example.com',
            'is_active' => false,
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email'    => 'inactive@example.com',
            'password' => 'password',
        ])->assertStatus(401);
    }

    // ── Me ────────────────────────────────────────────────────────────────────

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonFragment(['email' => $user->email]);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    // ── Update Profile ────────────────────────────────────────────────────────

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')
            ->putJson('/api/v1/auth/profile', [
                'display_name'       => 'New Name',
                'bio'                => 'I love sport',
                'city'               => 'São Paulo',
                'sports_preferences' => ['tennis'],
            ]);

        $response->assertOk()
            ->assertJsonFragment([
                'display_name' => 'New Name',
                'city'         => 'São Paulo',
            ]);

        $this->assertDatabaseHas('users', [
            'id'   => $user->id,
            'city' => 'São Paulo',
        ]);
    }

    public function test_update_profile_requires_authentication(): void
    {
        $this->putJson('/api/v1/auth/profile', ['display_name' => 'X'])
            ->assertStatus(401);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(204);
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    public function test_user_can_refresh_token(): void
    {
        $user  = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $this->withHeaders(['Authorization' => "Bearer $token"])
            ->postJson('/api/v1/auth/refresh')
            ->assertOk()
            ->assertJsonStructure(['access_token', 'token_type', 'expires_in']);
    }

    public function test_refresh_fails_with_invalid_token(): void
    {
        $this->withHeaders(['Authorization' => 'Bearer invalid.token.here'])
            ->postJson('/api/v1/auth/refresh')
            ->assertStatus(401);
    }
}
