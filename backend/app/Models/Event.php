<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'description',
        'sport',
        'location',
        'city',
        'date_start',
        'date_end',
        'organizer_id',
        'max_participants',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date_start' => 'datetime',
            'date_end'   => 'datetime',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(EventParticipant::class);
    }
}
