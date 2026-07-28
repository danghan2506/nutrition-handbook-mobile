const VIETNAMESE_MOBILE_NATIONAL_NUMBER = /^[35789]\d{8}$/;
const ALLOWED_PHONE_INPUT = /^[+\d\s().-]+$/;

export function normalizeVietnamesePhone(input: string): string | null {
  const value = input.trim();

  if (!value || !ALLOWED_PHONE_INPUT.test(value)) {
    return null;
  }

  const compact = value.replace(/[\s().-]/g, '');
  let nationalNumber: string;

  if (compact.startsWith('+84')) {
    nationalNumber = compact.slice(3);
  } else if (compact.startsWith('0')) {
    nationalNumber = compact.slice(1);
  } else if (VIETNAMESE_MOBILE_NATIONAL_NUMBER.test(compact)) {
    nationalNumber = compact;
  } else {
    return null;
  }

  return VIETNAMESE_MOBILE_NATIONAL_NUMBER.test(nationalNumber)
    ? `+84${nationalNumber}`
    : null;
}

export function maskVietnamesePhone(phone: string): string {
  const normalized = normalizeVietnamesePhone(phone);

  if (!normalized) {
    return phone;
  }

  const nationalNumber = normalized.slice(3);

  return `+84 ${nationalNumber.slice(0, 3)} *** ${nationalNumber.slice(-3)}`;
}

export function sanitizeOtp(input: string): string {
  return input.replace(/\D/g, '').slice(0, 6);
}
