import apiClient from '../client';
import { LoginRouter } from './LoginRouter';
import type { GuestLoginResponse, RefreshTokenResponse } from './LoginRouter';

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

// 백엔드 응답 구조
type ApiResponse<T> = {
  result: {
    result_code: number;
    result_message: string;
    result_description: string;
  };
  body: T;
};

// Refresh API 응답 구조
type RawRefreshTokenResponse = {
  result: {
    result_code: number;
    result_message: string;
    result_description: string;
  };
  body: {
    access_token: string;
    refresh_token: string;
    expired_at: string;
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
  refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const { method, path } = LoginRouter.refresh;
    const { data } = await apiClient.request<RawRefreshTokenResponse>({
      url: path,
      method,
      headers: {
        'refresh-token': refreshToken,
      },
      // Authorization 헤더는 제외 (refresh 요청은 refreshToken만 사용)
    });

    // snake_case → camelCase 매핑
    return {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiredAt: data.body.expired_at,
    };
  },
  logout: async (refreshToken: string): Promise<void> => {
    const { method, path } = LoginRouter.logout;
    await apiClient.request<ApiResponse<void>>({
      url: path,
      method,
      headers: {
        'refresh-token': refreshToken,
      },
      // Authorization 헤더는 apiClient interceptor에서 자동으로 추가됨
      // data body는 사용하지 않음 (헤더로만 전달)
    });
  },
} as const;
