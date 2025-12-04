import apiClient from '../client';
import { LoginRouter } from './LoginRouter';
import type { GuestLoginResponse } from './LoginRouter';

// 백엔드 응답 구조에 맞는 타입
// { result: {...}, body: { access_token, refresh_token, expired_at, role } }
type RawGuestLoginResponse = {
  result: {
    result_code: number;
    result_message: string;
    result_description: string;
  };
  body: {
    access_token: string;
    refresh_token: string;
    expired_at: string;
    role: string;
  };
};

export const RestLoginRouter = {
  guestLogin: async (): Promise<GuestLoginResponse> => {
    const { method, path } = LoginRouter.guestLogin;
    const { data } = await apiClient.request<RawGuestLoginResponse>({
      url: path,
      method,
    });

    // snake_case → camelCase 매핑
    return {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiredAt: data.body.expired_at,
      role: data.body.role,
    };
  },
} as const;
