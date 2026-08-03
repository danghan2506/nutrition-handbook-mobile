import { normalizeVietnamesePhone, sanitizeOtp } from './phone-number';
import { supabase } from './supabase';
import type {
  PhoneAuthClient,
  RequestOtpResult,
  SignOutAuthClient,
  SignOutResult,
  VerifyOtpResult,
} from '@/types/auth';

const defaultClient = supabase as unknown as PhoneAuthClient | null;
const defaultSignOutClient = supabase as unknown as SignOutAuthClient | null;

export async function requestPhoneOtp(
  phoneInput: string,
  client: PhoneAuthClient | null = defaultClient,
): Promise<RequestOtpResult> {
  const phone = normalizeVietnamesePhone(phoneInput);

  if (!phone) {
    return {
      ok: false,
      reason: 'invalid_phone',
      message: 'Bạn kiểm tra lại số điện thoại Việt Nam nhé.',
    };
  }

  if (!client) {
    return {
      ok: false,
      reason: 'not_configured',
      message: 'Đăng nhập đang được cấu hình. Bạn vui lòng thử lại sau.',
    };
  }

  try {
    const { error } = await client.auth.signInWithOtp({ phone });

    if (error) {
      return {
        ok: false,
        reason: 'request_failed',
        message: 'Chưa thể gửi mã lúc này. Bạn vui lòng thử lại sau một chút.',
      };
    }

    return { ok: true, phone };
  } catch {
    return {
      ok: false,
      reason: 'request_failed',
      message: 'Chưa thể gửi mã lúc này. Bạn vui lòng thử lại sau một chút.',
    };
  }
}

export async function verifyPhoneOtp(
  phoneInput: string,
  otpInput: string,
  client: PhoneAuthClient | null = defaultClient,
): Promise<VerifyOtpResult> {
  const phone = normalizeVietnamesePhone(phoneInput);
  const token = sanitizeOtp(otpInput);

  if (!phone || token.length !== 6) {
    return {
      ok: false,
      reason: 'invalid_otp',
      message: 'Mã xác thực gồm 6 chữ số. Bạn kiểm tra lại nhé.',
    };
  }

  if (!client) {
    return {
      ok: false,
      reason: 'not_configured',
      message: 'Đăng nhập đang được cấu hình. Bạn vui lòng thử lại sau.',
    };
  }

  try {
    const { error } = await client.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      return {
        ok: false,
        reason: 'verification_failed',
        message: 'Mã chưa đúng hoặc đã hết hạn. Bạn thử lại nhé.',
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: 'verification_failed',
      message: 'Chưa thể xác thực lúc này. Bạn vui lòng thử lại sau một chút.',
    };
  }
}

export async function signOutCurrentUser(
  client: SignOutAuthClient | null = defaultSignOutClient,
): Promise<SignOutResult> {
  if (!client) {
    return {
      ok: false,
      reason: 'not_configured',
      message: 'Đăng xuất đang được cấu hình. Bạn vui lòng thử lại sau.',
    };
  }

  try {
    const { error } = await client.auth.signOut();

    if (error) {
      return {
        ok: false,
        reason: 'sign_out_failed',
        message: 'Chưa thể đăng xuất lúc này. Bạn vui lòng thử lại sau một chút.',
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: 'sign_out_failed',
      message: 'Chưa thể đăng xuất lúc này. Bạn vui lòng thử lại sau một chút.',
    };
  }
}
