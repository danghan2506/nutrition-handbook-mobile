export type AuthFailureReason =
  | 'invalid_phone'
  | 'invalid_otp'
  | 'not_configured'
  | 'request_failed'
  | 'sign_out_failed'
  | 'verification_failed';

export type AuthFailure = {
  ok: false;
  reason: AuthFailureReason;
  message: string;
};

export type RequestOtpResult =
  | { ok: true; phone: string }
  | AuthFailure;

export type VerifyOtpResult = { ok: true } | AuthFailure;

export type SignOutResult = { ok: true } | AuthFailure;

export type PhoneAuthClient = {
  auth: {
    signInWithOtp: (input: {
      phone: string;
    }) => Promise<{ error: unknown | null }>;
    verifyOtp: (input: {
      phone: string;
      token: string;
      type: 'sms';
    }) => Promise<{ error: unknown | null; data?: unknown }>;
  };
};

export type SignOutAuthClient = {
  auth: {
    signOut: () => Promise<{ error: unknown | null }>;
  };
};
