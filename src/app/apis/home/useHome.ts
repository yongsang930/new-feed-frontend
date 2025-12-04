import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RestHomeRouter } from './RestHomeRouter';

// 무한 스크롤용 (처음 30개만)
export const usePostsInfinite = (keywordIds?: number[]) => {
  const PAGE_SIZE = 30; // 한 번에 30개씩 로드
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', keywordIds],
    queryFn: ({ pageParam = 0 }) => RestHomeRouter.getPosts(pageParam, PAGE_SIZE, keywordIds),
    getNextPageParam: (lastPage, allPages) => {
      // 모든 페이지의 총 아이템 수 계산
      const totalItems = allPages.reduce((sum, page) => sum + page.length, 0);
      
      // 30개 미만이면 다음 페이지 로드
      if (totalItems < PAGE_SIZE) {
        // 마지막 페이지가 비어있으면 더 이상 없음
        if (lastPage.length === 0) return undefined;
        // 마지막 페이지가 PAGE_SIZE보다 작으면 더 이상 없음
        if (lastPage.length < PAGE_SIZE) return undefined;
        // 다음 페이지 번호 반환 (page 0 다음은 page 1)
        return allPages.length;
      }
      
      // 30개 이상이면 더 이상 로드하지 않음
      return undefined;
    },
    initialPageParam: 0,
  });
};

// 페이징용 (30개 이후)
export const usePostsPaginated = (page: number, size: number, keywordIds?: number[]) => {
  return useQuery({
    queryKey: ['posts', 'paginated', page, size, keywordIds],
    queryFn: () => RestHomeRouter.getPosts(page, size, keywordIds),
  });
};

// 기존 호환성을 위한 훅 (무한 스크롤 사용)
export const usePosts = () => usePostsInfinite();

export const useKeywords = () =>
  useQuery({
    queryKey: ['keywords'],
    queryFn: RestHomeRouter.getKeywords,
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 간주 (이 시간 내에는 재요청 안 함)
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지 (React Query v5에서는 cacheTime 대신 gcTime 사용)
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
    refetchOnMount: false, // 마운트 시 자동 refetch 비활성화 (캐시된 데이터가 있으면 사용)
  });

export const useUserKeywords = () =>
  useQuery({
    queryKey: ['userKeywords'],
    queryFn: RestHomeRouter.getUserKeywords,
  });

export const useUpdateUserKeywords = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: RestHomeRouter.updateUserKeywords,
    onSuccess: () => {
      // 키워드 업데이트 후 posts 및 keywords 재조회
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      queryClient.invalidateQueries({ queryKey: ['userKeywords'] });
    },
  });
};

export const useRecommendKeywords = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: RestHomeRouter.recommendKeywords,
    onSuccess: () => {
      // 추천 키워드 추가 후 keywords 재조회
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
    },
  });
};


