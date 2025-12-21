export type Role = 'GUEST' | 'USER' | 'ADMIN' | string;

export type GuestLoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiredAt: string;
  role: Role;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiredAt: string;
};

export const LoginRouter = {
  guestLogin: {
    method: 'POST',
    // 백엔드의 @RequestMapping("/api/auth") + @PostMapping("/guest") 와 매칭
    path: '/api/auth/guest',
  },
  refresh: {
    method: 'POST',
    // 백엔드의 @RequestMapping("/api/auth") + @PostMapping("/refresh") 와 매칭
    path: '/api/auth/refresh',
  },
  logout: {
    method: 'POST',
    // 백엔드의 @RequestMapping("/api/auth") + @PostMapping("/logout") 와 매칭
    path: '/api/auth/logout',
  },
} as const;
