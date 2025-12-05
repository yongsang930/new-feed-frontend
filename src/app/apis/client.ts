import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';

// 환경 변수 확인 및 디버깅
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';
if (!baseURL) {
  console.warn('⚠️ VITE_API_BASE_URL이 설정되지 않았습니다. .env 파일을 확인하세요.');
}

const apiClient = axios.create({
  baseURL,
  timeout: 10000, // 10초 타임아웃
});

// baseURL 로깅 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log('API Base URL:', baseURL || '(설정되지 않음)');
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 응답 에러 핸들링
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 서버 연결 실패 시 에러 로깅
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('서버 연결 실패:', {
        message: error.message,
        code: error.code,
        baseURL: import.meta.env.VITE_API_BASE_URL,
        url: error.config?.url,
      });
      // 전역 메시지 API 사용 (MessageContextProvider가 마운트된 경우)
      const messageApi = (window as any).__messageApi;
      if (messageApi) {
        messageApi.error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        // MessageContextProvider가 아직 마운트되지 않은 경우 fallback
        console.error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
    } else if (error.response) {
      // 서버 응답은 있지만 에러 상태 코드
      console.error('API 에러:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    } else {
      console.error('알 수 없는 에러:', error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
