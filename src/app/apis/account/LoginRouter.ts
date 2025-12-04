export type Role = 'GUEST' | 'USER' | 'ADMIN' | string;

export type GuestLoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiredAt: string;
  role: Role;
};

export const LoginRouter = {
  guestLogin: {
    method: 'POST',
    // 백엔드의 @RequestMapping("/api/auth") + @PostMapping("/guest") 와 매칭
    path: '/api/auth/guest',
  },
} as const;
