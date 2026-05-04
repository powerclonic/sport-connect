<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    // GET /events
    public function index(Request $request): JsonResponse
    {
        $query = Event::where('status', 'active');

        if ($request->filled('sport')) {
            $query->where('sport', $request->sport);
        }
        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        $events = $query->orderBy('date_start')
            ->skip($request->integer('skip', 0))
            ->take(min($request->integer('limit', 20), 100))
            ->get();

        return response()->json($events->map(fn (Event $e) => $this->eventResponse($e)));
    }

    // POST /events
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'required|string|max:200',
            'description'      => 'nullable|string',
            'sport'            => 'required|string|max:50',
            'location'         => 'nullable|string|max:255',
            'city'             => 'required|string|max:100',
            'date_start'       => 'required|date',
            'date_end'         => 'required|date|after:date_start',
            'max_participants' => 'nullable|integer|min:1',
        ]);

        $event = Event::create([
            ...$data,
            'organizer_id' => $request->user()->id,
        ]);

        return response()->json($this->eventResponse($event), 201);
    }

    // GET /events/{event}
    public function show(Event $event): JsonResponse
    {
        return response()->json($this->eventDetailResponse($event));
    }

    // PUT /events/{event}
    public function update(Request $request, Event $event): JsonResponse
    {
        if ($event->organizer_id !== $request->user()->id) {
            return response()->json(['message' => 'Only organizer can update event.'], 403);
        }

        $data = $request->validate([
            'title'            => 'nullable|string|max:200',
            'description'      => 'nullable|string',
            'sport'            => 'nullable|string|max:50',
            'location'         => 'nullable|string|max:255',
            'city'             => 'nullable|string|max:100',
            'date_start'       => 'nullable|date',
            'date_end'         => 'nullable|date',
            'max_participants' => 'nullable|integer|min:1',
            'status'           => 'nullable|in:active,cancelled,completed',
        ]);

        if (isset($data['date_start']) && isset($data['date_end'])) {
            if ($data['date_end'] <= $data['date_start']) {
                return response()->json(['message' => 'End date must be after start date.'], 400);
            }
        } elseif (isset($data['date_end']) && $data['date_end'] <= $event->date_start) {
            return response()->json(['message' => 'End date must be after start date.'], 400);
        } elseif (isset($data['date_start']) && $event->date_end <= $data['date_start']) {
            return response()->json(['message' => 'End date must be after start date.'], 400);
        }

        $event->update(array_filter($data, fn ($v) => $v !== null));

        return response()->json($this->eventResponse($event->fresh()));
    }

    // DELETE /events/{event}
    public function destroy(Request $request, Event $event): JsonResponse
    {
        if ($event->organizer_id !== $request->user()->id) {
            return response()->json(['message' => 'Only organizer can delete event.'], 403);
        }

        $event->delete();

        return response()->json(null, 204);
    }

    // POST /events/{event}/join
    public function join(Request $request, Event $event): JsonResponse
    {
        $userId = $request->user()->id;

        return DB::transaction(function () use ($userId, $event) {
            // Re-fetch with a write lock to prevent race conditions on capacity checks
            $event = Event::lockForUpdate()->findOrFail($event->id);

            if ($event->status !== 'active') {
                return response()->json(['message' => 'Cannot join inactive event.'], 400);
            }

            if (EventParticipant::where('user_id', $userId)->where('event_id', $event->id)->exists()) {
                return response()->json(['message' => 'Already joined event.'], 400);
            }

            if ($event->max_participants) {
                $count = EventParticipant::where('event_id', $event->id)->count();
                if ($count >= $event->max_participants) {
                    return response()->json(['message' => 'Event is full.'], 400);
                }
            }

            EventParticipant::create([
                'user_id'  => $userId,
                'event_id' => $event->id,
                'status'   => 'joined',
            ]);

            return response()->json($this->eventResponse($event));
        });
    }

    // DELETE /events/{event}/leave
    public function leave(Request $request, Event $event): JsonResponse
    {
        $participant = EventParticipant::where('user_id', $request->user()->id)
            ->where('event_id', $event->id)
            ->first();

        if (! $participant) {
            return response()->json(['message' => 'Not participant in event.'], 404);
        }

        $participant->delete();

        return response()->json(null, 204);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function participantCount(Event $event): int
    {
        return EventParticipant::where('event_id', $event->id)->count();
    }

    private function eventResponse(Event $event): array
    {
        return [
            'id'                => $event->id,
            'title'             => $event->title,
            'description'       => $event->description,
            'sport'             => $event->sport,
            'location'          => $event->location,
            'city'              => $event->city,
            'date_start'        => $event->date_start,
            'date_end'          => $event->date_end,
            'organizer_id'      => $event->organizer_id,
            'max_participants'  => $event->max_participants,
            'status'            => $event->status,
            'participant_count' => $this->participantCount($event),
            'created_at'        => $event->created_at,
            'updated_at'        => $event->updated_at,
        ];
    }

    private function eventDetailResponse(Event $event): array
    {
        return $this->eventResponse($event);
    }
}
