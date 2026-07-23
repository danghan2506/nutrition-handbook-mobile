export type SocialAuthProvider = 'google' | 'facebook';

export type SocialAuthResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'redirected' };

export type OAuthCallbackResult =
  | { status: 'success'; code: string }
  | { status: 'cancelled' }
  | { status: 'error' };
