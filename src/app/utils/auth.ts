/**
 * 사용자 인증 관련 유틸리티 함수
 */

export type Role = 'GUEST' | 'USER' | 'ADMIN' | string;

/**
 * localStorage에서 사용자 Role 가져오기
 */
export const getUserRole = (): Role | null => {
  return localStorage.getItem('userRole') as Role | null;
};

/**
 * 게스트 사용자 여부 확인
 */
export const isGuest = (): boolean => {
  const role = getUserRole();
  return role === 'GUEST' || role === null;
};

/**
 * 인증된 사용자 여부 확인
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  const role = getUserRole();
  return !!token && role !== 'GUEST' && role !== null;
};

