import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 토큰이 없으면 로그인 페이지로 리다이렉트하는 보호된 라우트 컴포넌트
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('accessToken');
  
  useEffect(() => {
    if (!token) {
      // 기존 에러 코드와 동일한 메시지 사용 (403 에러 메시지)
      const messageApi = (window as any).__messageApi;
      if (messageApi) {
        messageApi.error('접근 권한이 없습니다.');
      }
    }
  }, [token]);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

