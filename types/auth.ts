export type SocialAuthProvider = 'google' | 'facebook';

export type SocialAuthResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'redirected' };

export type OAuthTokens = {
  accessToken: string;
  refreshToken: string;
};