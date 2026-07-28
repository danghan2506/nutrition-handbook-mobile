export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 60;

export const AUTH_COPY = {
  brand: 'AURALE',
  loginTitle: 'Chào mừng bạn quay trở lại.',
  loginDescription:
    'Đăng nhập để lưu lại bữa ăn, thói quen và những ghi chú sức khỏe quan trọng.',
  phoneLabel: 'Số điện thoại',
  phonePlaceholder: 'Nhập số điện thoại',
  continue: 'Tiếp tục',
  divider: 'hoặc',
  google: 'Tiếp tục với Google',
  facebook: 'Tiếp tục với Facebook',
  legal:
    'Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư.',
  otpTitle: 'Xác minh số điện thoại',
  otpDescription: (phone: string) =>
    `Nhập mã xác thực gồm 6 số cho ${phone}.`,
  verify: 'Xác minh',
  resend: 'Gửi lại mã',
  otpPrivacy: 'Mã xác thực chỉ dùng một lần.',
  socialError: 'Chưa thể đăng nhập. Vui lòng thử lại.',
  otpError: 'Mã xác thực chưa đúng hoặc đã hết hạn. Vui lòng thử lại.',
  configurationError: 'Đăng nhập chưa được cấu hình. Vui lòng thử lại sau.',
} as const;
