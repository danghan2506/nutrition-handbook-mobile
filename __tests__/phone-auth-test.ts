import { requestPhoneOtp, verifyPhoneOtp } from '../lib/auth';

function createAuthClient() {
  return {
    auth: {
      signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
      verifyOtp: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      }),
    },
  };
}

describe('phone authentication', () => {
  it('requests an SMS OTP for a normalized phone number', async () => {
    const client = createAuthClient();

    await expect(requestPhoneOtp('0912 345 678', client)).resolves.toEqual({
      ok: true,
      phone: '+84912345678',
    });
    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({
      phone: '+84912345678',
    });
  });

  it('does not call Supabase when the phone number is invalid', async () => {
    const client = createAuthClient();

    await expect(requestPhoneOtp('123', client)).resolves.toMatchObject({
      ok: false,
      reason: 'invalid_phone',
    });
    expect(client.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('verifies a six-digit SMS token', async () => {
    const client = createAuthClient();

    await expect(
      verifyPhoneOtp('+84912345678', '123456', client),
    ).resolves.toEqual({ ok: true });
    expect(client.auth.verifyOtp).toHaveBeenCalledWith({
      phone: '+84912345678',
      token: '123456',
      type: 'sms',
    });
  });

  it('rejects an incomplete OTP without calling Supabase', async () => {
    const client = createAuthClient();

    await expect(
      verifyPhoneOtp('+84912345678', '123', client),
    ).resolves.toMatchObject({ ok: false, reason: 'invalid_otp' });
    expect(client.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it('maps provider errors to calm Vietnamese feedback', async () => {
    const client = createAuthClient();
    client.auth.signInWithOtp.mockResolvedValueOnce({
      error: new Error('provider secret'),
    });

    await expect(
      requestPhoneOtp('+84912345678', client),
    ).resolves.toEqual({
      ok: false,
      reason: 'request_failed',
      message: 'Chưa thể gửi mã lúc này. Bạn vui lòng thử lại sau một chút.',
    });
  });

  it('reports missing local configuration without throwing', async () => {
    await expect(requestPhoneOtp('+84912345678', null)).resolves.toMatchObject({
      ok: false,
      reason: 'not_configured',
    });
  });
});
