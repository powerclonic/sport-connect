<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    // GET /conversations
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $conversations = Conversation::whereJsonContains('participant_ids', $userId)
            ->orderByDesc('updated_at')
            ->skip($request->integer('skip', 0))
            ->take(min($request->integer('limit', 20), 100))
            ->get();

        return response()->json($conversations->map(function (Conversation $c) {
            return [
                'id'              => $c->id,
                'participant_ids' => $c->participant_ids,
                'message_count'   => $c->messages()->count(),
                'created_at'      => $c->created_at,
                'updated_at'      => $c->updated_at,
            ];
        }));
    }

    // POST /conversations
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'participant_id' => 'required|uuid|exists:users,id',
        ]);

        $userId = $request->user()->id;

        if ($data['participant_id'] === $userId) {
            return response()->json(['message' => 'Cannot create conversation with self.'], 400);
        }

        $participantIds = [$userId, $data['participant_id']];
        sort($participantIds);

        // Find existing conversation between the two participants
        // Use JSON_CONTAINS to query at the database level
        $participantJson = json_encode($participantIds);
        $existing = Conversation::whereRaw('JSON_CONTAINS(participant_ids, ?)', [$participantJson])->first();

        if ($existing) {
            return response()->json([
                'id'              => $existing->id,
                'participant_ids' => $existing->participant_ids,
                'message_count'   => 0,
                'created_at'      => $existing->created_at,
                'updated_at'      => $existing->updated_at,
            ]);
        }

        $conversation = Conversation::create(['participant_ids' => $participantIds]);

        return response()->json([
            'id'              => $conversation->id,
            'participant_ids' => $conversation->participant_ids,
            'message_count'   => 0,
            'created_at'      => $conversation->created_at,
            'updated_at'      => $conversation->updated_at,
        ], 201);
    }

    // GET /conversations/{conversation}
    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;

        if (! in_array($userId, $conversation->participant_ids, true)) {
            return response()->json(['message' => 'Not participant in conversation.'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderByDesc('created_at')
            ->skip($request->integer('skip', 0))
            ->take(min($request->integer('limit', 50), 100))
            ->get()
            ->reverse()
            ->values();

        $msgResponses = $messages->map(function (Message $msg) {
            $sender = $msg->sender;
            return [
                'id'              => $msg->id,
                'conversation_id' => $msg->conversation_id,
                'sender_id'       => $msg->sender_id,
                'sender_name'     => $sender?->display_name ?? $sender?->email,
                'text'            => $msg->text,
                'created_at'      => $msg->created_at,
            ];
        });

        return response()->json([
            'id'              => $conversation->id,
            'participant_ids' => $conversation->participant_ids,
            'messages'        => $msgResponses,
            'created_at'      => $conversation->created_at,
            'updated_at'      => $conversation->updated_at,
        ]);
    }

    // POST /conversations/{conversation}/messages
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;

        if (! in_array($userId, $conversation->participant_ids, true)) {
            return response()->json(['message' => 'Not participant in conversation.'], 403);
        }

        $data = $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $userId,
            'text'            => $data['text'],
        ]);

        // Touch conversation updated_at
        $conversation->touch();

        $sender = $request->user();

        return response()->json([
            'id'              => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id'       => $message->sender_id,
            'sender_name'     => $sender->display_name ?? $sender->email,
            'text'            => $message->text,
            'created_at'      => $message->created_at,
        ], 201);
    }
}
