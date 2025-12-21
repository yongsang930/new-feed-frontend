import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { RestLoginRouter } from './account/RestLoginRouter';

// 환경 변수 확인 및 디버깅
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';
if (!baseURL) {
  console.warn('VITE_API_BASE_URL이 설정되지 않았습니다. .env 파일을 확인하세요.');
}

const apiClient = axios.create({
  baseURL,
  timeout: 10000, // 10초 타임아웃
});

// 백엔드 에러 응답 구조
type ApiErrorResponse = {
  result: {
    resultCode?: number; // 에러 코드
    resultMessage?: string; // 에러 메시지
    resultDescription?: string; // 에러 설명
    // 기존 형태 호환성
    httpStatusCode?: number;
    errorCode?: number;
    description?: string;
    result_code?: number;
    result_message?: string;
    result_description?: string;
  };
  body: null;
  // 다른 형태의 에러 메시지
  message?: string;
};

// 에러 코드 정의 (단축)
const ACCESS_TOKEN_EXPIRED = 2100;
const REFRESH_TOKEN_EXPIRED = 2001;
const INVALID_TOKEN = 2000;
const REFRESH_TOKEN_NOT_FOUND = 2005;
const AUTHORIZATION_TOKEN_NOT_FOUND = 2003;

// 토큰 갱신 중 플래그 (무한 루프 방지)
let isRefreshing = false;
// 갱신 대기 중인 요청들을 저장
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// 중복 메시지 방지: 마지막으로 표시한 메시지와 시간 저장
let lastShownMessage: { message: string; timestamp: number } | null = null;
const MESSAGE_DEBOUNCE_TIME = 5000; // 5초 동안 같은 메시지는 중복 표시하지 않음

// 중복 메시지 체크 및 표시 함수
const showErrorMessage = (message: string) => {
  const now = Date.now();
  
  // 같은 메시지가 5초 이내에 이미 표시되었는지 체크
  if (
    lastShownMessage &&
    lastShownMessage.message === message &&
    now - lastShownMessage.timestamp < MESSAGE_DEBOUNCE_TIME
  ) {
    // 5초 이내에 이미 표시된 같은 메시지면 무시
    return;
  }
  
  // 메시지 표시
  const messageApi = (window as any).__messageApi;
  if (messageApi) {
    messageApi.error(message);
    // 마지막 표시 메시지와 시간 기록
    lastShownMessage = { message, timestamp: now };
  }
};

// 자동 로그아웃 처리 함수
const performAutoLogout = () => {
  // 로컬스토리지에서 모든 인증 정보 삭제
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('guestSelectedKeywords');
  localStorage.removeItem('userId');
  localStorage.removeItem('guestUUID');
  
  // 로그인 페이지로 이동
  // React Router를 사용할 수 없으므로 window.location 사용
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 토큰 갱신 처리 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1) AccessToken 만료 → refresh() 실행
const shouldRefresh = (errorCode: number | null, url: string, retried?: boolean) => {
  return (
    errorCode === ACCESS_TOKEN_EXPIRED &&
    !url.includes('/auth/refresh') &&
    !retried
  );
};

// 2) RefreshToken 관련 오류 → 즉시 로그아웃
const shouldLogout = (errorCode: number | null) => {
  return (
    errorCode === REFRESH_TOKEN_EXPIRED ||
    errorCode === INVALID_TOKEN ||
    errorCode === REFRESH_TOKEN_NOT_FOUND ||
    errorCode === AUTHORIZATION_TOKEN_NOT_FOUND
  );
};

// 응답 에러 핸들링
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const data = error.response?.data;
    // 에러 코드: resultCode 우선, 없으면 errorCode 사용
    const errorCode = data?.result?.resultCode ?? data?.result?.errorCode ?? null;
    const url = original?.url ?? '';

    // 로그아웃 API는 실패해도 조용히 처리 (이미 로컬스토리지 삭제 및 리다이렉트 처리됨)
    if (url.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    // 서버 연결 실패 처리
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      showErrorMessage('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      return Promise.reject(error);
    }

    // 서버 응답이 없는 경우
    if (!error.response) {
      showErrorMessage('알 수 없는 오류가 발생했습니다.');
      return Promise.reject(error);
    }

    // 1) RefreshToken 즉시 로그아웃 (반드시 에러 메시지 표시 후 로그아웃)
    if (shouldLogout(errorCode)) {
      // 백엔드에서 받은 메시지 우선 사용, 없으면 기본 메시지
      const errorMessage = data?.result?.resultDescription ?? data?.result?.resultMessage ?? data?.result?.description ?? data?.result?.result_description ?? data?.result?.result_message ?? '인증 오류가 발생했습니다. 다시 로그인해주세요.';
      // 중복 방지 로직이 포함된 메시지 표시
      showErrorMessage(errorMessage);
      // 메시지가 표시된 후 로그아웃
      setTimeout(() => {
        performAutoLogout();
      }, 1000);
      return Promise.reject(error);
    }

    // 2) AccessToken 만료 → refresh() 호출 (에러 메시지 표시하지 않음)
    if (shouldRefresh(errorCode, url, original._retry)) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // 백엔드에서 받은 메시지 우선 사용, 없으면 기본 메시지
        const errorMessage = data?.result?.resultDescription ?? data?.result?.resultMessage ?? data?.result?.description ?? data?.result?.result_description ?? data?.result?.result_message ?? '리프레시 토큰이 없습니다. 다시 로그인해주세요.';
        // 중복 방지 로직이 포함된 메시지 표시
        showErrorMessage(errorMessage);
        // 메시지가 표시된 후 로그아웃
        setTimeout(() => {
          performAutoLogout();
        }, 1000);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (original.headers) {
              original.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await RestLoginRouter.refresh(refreshToken);

        // accessToken만 갱신, refreshToken은 변경하지 않음 (로그아웃 제외하고 refreshToken은 건들지 않음)
        localStorage.setItem('accessToken', res.accessToken);

        isRefreshing = false;
        processQueue(null, res.accessToken);

        if (original.headers) {
          original.headers.Authorization = `Bearer ${res.accessToken}`;
        }
        // AccessToken 만료는 에러 메시지 표시하지 않고 refresh만 동작
        return apiClient(original);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        // refreshError에서 에러 메시지 추출
        const refreshErrorData = (refreshError as AxiosError<ApiErrorResponse>)?.response?.data;
        const errorMessage = refreshErrorData?.result?.resultDescription ?? refreshErrorData?.result?.resultMessage ?? refreshErrorData?.result?.description ?? refreshErrorData?.result?.result_description ?? refreshErrorData?.result?.result_message ?? '리프레시 토큰 갱신에 실패했습니다. 다시 로그인해주세요.';
        // 중복 방지 로직이 포함된 메시지 표시
        showErrorMessage(errorMessage);
        // 메시지가 표시된 후 로그아웃
        setTimeout(() => {
          performAutoLogout();
        }, 1000);
        return Promise.reject(refreshError);
      }
    }

    // 3) 그외는 백엔드에서 받은 오류 메시지 출력
    // 백엔드에서 받은 메시지 우선 사용 (서버 연결 문제나 알 수 없는 오류가 아닌 경우)
    const errorMessage = data?.result?.resultDescription ?? data?.result?.resultMessage ?? data?.result?.description ?? data?.result?.result_description ?? data?.result?.result_message ?? null;
    if (errorMessage) {
      showErrorMessage(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
