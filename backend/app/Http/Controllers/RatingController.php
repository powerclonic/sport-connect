<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    // GET /ratings/received
    public function received(Request $request): JsonResponse
    {
        $ratings = Rating::where('ratee_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->skip($request->integer('skip', 0))
            ->take(min($request->integer('limit', 20), 100))
            ->with('rater')
            ->get();

        return response()->json($ratings->map(fn (Rating $r) => $this->ratingResponse($r, author: true)));
    }

    // GET /ratings/given
    public function given(Request $request): JsonResponse
    {
        $ratings = Rating::where('rater_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->skip($request->integer('skip', 0))
            ->take(min($request->integer('limit', 20), 100))
            ->with('ratee')
            ->get();

        return response()->json($ratings->map(fn (Rating $r) => $this->ratingResponse($r, author: false)));
    }

    // POST /ratings
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_id' => 'required|uuid|exists:events,id',
            'ratee_id' => 'required|uuid|exists:users,id',
            'score'    => 'required|numeric|min:0|max:5',
            'comment'  => 'nullable|string',
        ]);

        $event = Event::findOrFail($data['event_id']);

        if ($event->date_end->isFuture()) {
            return response()->json(['message' => 'Event has not ended yet.'], 400);
        }

        $userId = $request->user()->id;

        if ((string) $data['ratee_id'] === (string) $userId) {
            return response()->json(['message' => 'Cannot rate yourself.'], 400);
        }

        $raterParticipant = EventParticipant::where('user_id', $userId)
            ->where('event_id', $data['event_id'])
            ->where('status', 'joined')
            ->exists();

        if (! $raterParticipant) {
            return response()->json(['message' => 'You must be a participant in the event to rate.'], 400);
        }

        $rateeParticipant = EventParticipant::where('user_id', $data['ratee_id'])
            ->where('event_id', $data['event_id'])
            ->where('status', 'joined')
            ->exists();

        if (! $rateeParticipant) {
            return response()->json(['message' => 'Ratee must be a participant in the event.'], 400);
        }

        if (Rating::where('rater_id', $userId)
            ->where('ratee_id', $data['ratee_id'])
            ->where('event_id', $data['event_id'])
            ->exists()
        ) {
            return response()->json(['message' => 'Already rated this user for this event.'], 400);
        }

        $rating = Rating::create([
            'rater_id' => $userId,
            'ratee_id' => $data['ratee_id'],
            'event_id' => $data['event_id'],
            'score'    => $data['score'],
            'comment'  => $data['comment'] ?? null,
        ]);

        $rating->load('ratee');

        return response()->json($this->ratingResponse($rating, author: false), 201);
    }

    // GET /users/{user}/stats
    public function userStats(User $user): JsonResponse
    {
        $gamesPlayed = EventParticipant::where('user_id', $user->id)
            ->where('status', 'joined')
            ->count();

        $avgRating = Rating::where('ratee_id', $user->id)->avg('score') ?? 0.0;

        return response()->json([
            'games_played'   => $gamesPlayed,
            'average_rating' => round((float) $avgRating, 2),
            'reliability'    => round((float) $avgRating, 2),
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function ratingResponse(Rating $rating, bool $author): array
    {
        $response = [
            'id'         => $rating->id,
            'rater_id'   => $rating->rater_id,
            'ratee_id'   => $rating->ratee_id,
            'event_id'   => $rating->event_id,
            'score'      => $rating->score,
            'comment'    => $rating->comment,
            'created_at' => $rating->created_at,
        ];

        if ($author) {
            $rater = $rating->relationLoaded('rater') ? $rating->rater : User::find($rating->rater_id);
            $response['author'] = $rater?->display_name ?? $rater?->email;
        } else {
            $ratee = $rating->relationLoaded('ratee') ? $rating->ratee : User::find($rating->ratee_id);
            $response['target_name'] = $ratee?->display_name ?? $ratee?->email;
        }

        return $response;
    }
}
