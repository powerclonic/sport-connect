<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'display_name',
        'avatar_url',
        'bio',
        'location',
        'city',
        'phone',
        'is_active',
        'is_verified',
        'sports_preferences',
        'profile_complete',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'is_verified'       => 'boolean',
            'profile_complete'  => 'boolean',
            'sports_preferences' => 'array',
        ];
    }

    // JWTSubject contract
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    // Relationships
    public function oauthAccounts(): HasMany
    {
        return $this->hasMany(OAuthAccount::class);
    }

    public function organizedEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'organizer_id');
    }

    public function eventParticipations(): HasMany
    {
        return $this->hasMany(EventParticipant::class);
    }

    public function ratingsGiven(): HasMany
    {
        return $this->hasMany(Rating::class, 'rater_id');
    }

    public function ratingsReceived(): HasMany
    {
        return $this->hasMany(Rating::class, 'ratee_id');
    }
}
