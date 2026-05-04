<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // POST /auth/register
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:8',
            'display_name'  => 'nullable|string|max:100',
            'sports'        => 'nullable|array',
            'sports.*'      => 'string',
        ]);

        $sports = $data['sports'] ?? [];

        $user = User::create([
            'email'              => $data['email'],
            'password'           => Hash::make($data['password']),
            'display_name'       => $data['display_name'] ?? null,
            'sports_preferences' => $sports,
            'profile_complete'   => count($sports) > 0,
        ]);

        $token = JWTAuth::fromUser($user);

        return $this->respondWithToken($token, 201);
    }

    // POST /auth/login
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Constant-time path: prevent user enumeration
        $user = User::where('email', $credentials['email'])->first();
        $dummyHash = '$2b$12$placeholder.hash.for.timing.attack.prevention.only';
        $hashToCheck = ($user && $user->password) ? $user->password : $dummyHash;
        $passwordOk = Hash::check($credentials['password'], $hashToCheck);

        if (! $user || ! $user->is_active || ! $passwordOk) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = JWTAuth::fromUser($user);

        return $this->respondWithToken($token);
    }

    // POST /auth/refresh
    public function refresh(): JsonResponse
    {
        try {
            $newToken = JWTAuth::parseToken()->refresh();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token cannot be refreshed.'], 401);
        }

        return $this->respondWithToken($newToken);
    }

    // POST /auth/logout
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::parseToken()->invalidate();
        } catch (\Exception) {
            // Token already invalid — ignore
        }

        return response()->json(null, 204);
    }

    // GET /auth/me
    public function me(Request $request): JsonResponse
    {
        return response()->json($this->userResponse($request->user()));
    }

    // PUT /auth/profile
    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'display_name'       => 'nullable|string|max:100',
            'bio'                => 'nullable|string|max:500',
            'location'           => 'nullable|string|max:150',
            'city'               => 'nullable|string|max:100',
            'phone'              => 'nullable|string|max:20',
            'sports_preferences' => 'nullable|array',
            'sports_preferences.*' => 'string',
        ]);

        $user = $request->user();

        $user->fill(array_filter($data, fn ($v) => $v !== null));
        $user->sports_preferences = $data['sports_preferences'] ?? $user->sports_preferences ?? [];
        $user->profile_complete = true;
        $user->save();

        return response()->json($this->userResponse($user));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function respondWithToken(string $token, int $status = 200): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => config('jwt.ttl') * 60,
        ], $status);
    }

    private function userResponse(User $user): array
    {
        return [
            'id'                 => $user->id,
            'email'              => $user->email,
            'display_name'       => $user->display_name,
            'avatar_url'         => $user->avatar_url,
            'bio'                => $user->bio,
            'location'           => $user->location,
            'city'               => $user->city,
            'phone'              => $user->phone,
            'is_active'          => $user->is_active,
            'is_verified'        => $user->is_verified,
            'sports_preferences' => $user->sports_preferences ?? [],
            'profile_complete'   => $user->profile_complete,
            'created_at'         => $user->created_at,
            'updated_at'         => $user->updated_at,
        ];
    }
}
