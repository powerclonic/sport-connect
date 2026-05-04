<?php

namespace App\Http\Controllers;

use App\Models\OAuthAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class OAuthController extends Controller
{
    private const SUPPORTED_PROVIDERS = ['google', 'facebook'];

    private const STATE_TTL = 600; // 10 minutes

    // GET /oauth/{provider}/redirect
    public function redirect(string $provider): JsonResponse
    {
        if (! in_array($provider, self::SUPPORTED_PROVIDERS, true)) {
            return response()->json(['message' => 'Unsupported OAuth provider.'], 400);
        }

        $state = Str::uuid()->toString();
        Cache::put("oauth_state:{$state}", $provider, self::STATE_TTL);

        $url = $this->getAuthorizationUrl($provider, $state);

        return response()->json(['authorization_url' => $url]);
    }

    // GET /oauth/{provider}/callback
    public function callback(Request $request, string $provider): RedirectResponse
    {
        if (! in_array($provider, self::SUPPORTED_PROVIDERS, true)) {
            return redirect(config('app.frontend_url').'/oauth/callback?error=unsupported_provider');
        }

        $error = $request->query('error');
        if ($error) {
            return redirect(config('app.frontend_url').'/oauth/callback?error='.urlencode((string) $error));
        }

        $code  = $request->query('code');
        $state = $request->query('state');

        if (! $code || ! $state) {
            return redirect(config('app.frontend_url').'/oauth/callback?error=missing_params');
        }

        $storedProvider = Cache::get("oauth_state:{$state}");
        if (! $storedProvider || $storedProvider !== $provider) {
            return redirect(config('app.frontend_url').'/oauth/callback?error=invalid_state');
        }
        Cache::forget("oauth_state:{$state}");

        try {
            $tokenData = $this->exchangeCode($provider, $code);
        } catch (\Exception) {
            return redirect(config('app.frontend_url').'/oauth/callback?error=token_exchange_failed');
        }

        $accessToken          = $tokenData['access_token'] ?? '';
        $providerRefreshToken = $tokenData['refresh_token'] ?? null;

        try {
            $userInfo = $this->getUserInfo($provider, $accessToken);
        } catch (\Exception) {
            return redirect(config('app.frontend_url').'/oauth/callback?error=user_info_failed');
        }

        $oauthAccount = OAuthAccount::where('provider', $provider)
            ->where('provider_user_id', $userInfo['id'])
            ->first();

        if ($oauthAccount) {
            $oauthAccount->update([
                'access_token_encrypted'  => encrypt($accessToken),
                'refresh_token_encrypted' => $providerRefreshToken ? encrypt($providerRefreshToken) : null,
            ]);
            $user = User::find($oauthAccount->user_id);
            if (! $user || ! $user->is_active) {
                return redirect(config('app.frontend_url').'/oauth/callback?error=account_inactive');
            }
        } else {
            $user = User::firstOrCreate(
                ['email' => $userInfo['email']],
                [
                    'display_name' => $userInfo['name'] ?? null,
                    'avatar_url'   => $userInfo['picture'] ?? null,
                    'is_verified'  => true,
                ]
            );

            $user->oauthAccounts()->create([
                'provider'                => $provider,
                'provider_user_id'        => $userInfo['id'],
                'access_token_encrypted'  => encrypt($accessToken),
                'refresh_token_encrypted' => $providerRefreshToken ? encrypt($providerRefreshToken) : null,
            ]);
        }

        $token = JWTAuth::fromUser($user);

        $redirectUrl = config('app.frontend_url').'/oauth/callback'
            .'#access_token='.$token;

        return redirect($redirectUrl);
    }

    // ── Provider helpers ──────────────────────────────────────────────────────

    private function getAuthorizationUrl(string $provider, string $state): string
    {
        $redirectUri = config('app.oauth_redirect_base_url')."/api/v1/oauth/{$provider}/callback";

        if ($provider === 'google') {
            return 'https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query([
                'client_id'     => config('services.google.client_id'),
                'redirect_uri'  => $redirectUri,
                'response_type' => 'code',
                'scope'         => 'openid email profile',
                'state'         => $state,
            ]);
        }

        // Facebook
        return 'https://www.facebook.com/v18.0/dialog/oauth?'.http_build_query([
            'client_id'     => config('services.facebook.client_id'),
            'redirect_uri'  => $redirectUri,
            'response_type' => 'code',
            'scope'         => 'email,public_profile',
            'state'         => $state,
        ]);
    }

    private function exchangeCode(string $provider, string $code): array
    {
        $redirectUri = config('app.oauth_redirect_base_url')."/api/v1/oauth/{$provider}/callback";

        if ($provider === 'google') {
            $response = Http::post('https://oauth2.googleapis.com/token', [
                'code'          => $code,
                'client_id'     => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'redirect_uri'  => $redirectUri,
                'grant_type'    => 'authorization_code',
            ]);
        } else {
            $response = Http::get('https://graph.facebook.com/v18.0/oauth/access_token', [
                'code'          => $code,
                'client_id'     => config('services.facebook.client_id'),
                'client_secret' => config('services.facebook.client_secret'),
                'redirect_uri'  => $redirectUri,
            ]);
        }

        $response->throw();

        return $response->json();
    }

    private function getUserInfo(string $provider, string $accessToken): array
    {
        if ($provider === 'google') {
            $response = Http::withToken($accessToken)
                ->get('https://www.googleapis.com/oauth2/v2/userinfo');
        } else {
            $response = Http::withToken($accessToken)
                ->get('https://graph.facebook.com/me', ['fields' => 'id,name,email,picture']);
        }

        $response->throw();

        return $response->json();
    }
}
