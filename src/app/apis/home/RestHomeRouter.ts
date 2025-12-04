import apiClient from '../client';
import { HomeRouter } from './HomeRouter';

export type Post = {
  id: number;
  title: string;
  content: string;
  summary?: string;
  img?: string;
  tag?: string;
  description?: string;
  link?: string;
  authors?: Array<{ name: string; avatar?: string }>;
  createdAt?: string;
  published_at?: string;
  region?: string;
  keywords?: Array<{
    keyword_id: number;
    en_name: string;
    ko_name: string;
    selected?: boolean;
  }>;
};

// 백엔드 응답 타입 (snake_case)
type RawKeyword = {
  keyword_id: number;
  en_name: string;
  ko_name: string;
  selected?: boolean;
};

// 프론트엔드에서 사용하는 타입 (camelCase)
export type Keyword = {
  keywordId: number;
  enName: string;
  koName: string;
  selected?: boolean;
};

export type Me = {
  id: number;
  name: string;
  region?: string;
};

// 백엔드 Api<T> 래퍼 타입
type ApiResponse<T> = {
  result: {
    result_code: number;
    result_message: string;
    result_description: string;
  };
  body: T;
};

// 페이지네이션 응답 타입
type PaginatedResponse<T> = {
  content: T[];
  pageable: {
    page_number: number;
    page_size: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  total_pages: number;
  total_elements: number;
  first: boolean;
  number_of_elements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
};

export const RestHomeRouter = {
  getPosts: async (page: number = 0, size: number = 30, keywordIds?: number[]): Promise<Post[]> => {
    const { method, path } = HomeRouter.posts;
    const params: Record<string, unknown> = {
      page,
      size,
    };
    
    // keywordIds가 있으면 List<Long> 형태로 전달 (axios가 배열을 자동으로 처리)
    if (keywordIds && keywordIds.length > 0) {
      params.keywordIds = keywordIds;
    }
    
    const { data } = await apiClient.request<ApiResponse<PaginatedResponse<Post>>>({
      url: path,
      method,
      params,
    });
    // Api<PaginatedResponse<Post>> 형태에서 body.content 추출
    if (data.body && Array.isArray(data.body.content)) {
      return data.body.content;
    }
    return [];
  },
  getKeywords: async (): Promise<Keyword[]> => {
    const { method, path } = HomeRouter.keywords;
    const { data } = await apiClient.request<ApiResponse<RawKeyword[]>>({
      url: path,
      method,
    });
    // Api<RawKeyword[]> 형태에서 body만 추출하고 snake_case → camelCase 변환
    const rawKeywords = Array.isArray(data.body) ? data.body : [];
    return rawKeywords.map((raw: RawKeyword) => ({
      keywordId: raw.keyword_id,
      enName: raw.en_name,
      koName: raw.ko_name,
      selected: raw.selected,
    }));
  },
  getUserKeywords: async (): Promise<number[]> => {
    const { method, path } = HomeRouter.userKeywords;
    const { data } = await apiClient.request<ApiResponse<number[]>>({
      url: path,
      method,
    });
    // Api<number[]> 형태에서 body만 추출 (keyword_id 배열)
    return Array.isArray(data.body) ? data.body : [];
  },
  updateUserKeywords: async (keywordIds: number[]): Promise<void> => {
    const { method, path } = HomeRouter.updateUserKeywords;
    await apiClient.request<ApiResponse<void>>({
      url: path,
      method,
      data: { keywordIds },
    });
  },
  recommendKeywords: async (keywords: Array<{ koName: string; enName: string }>): Promise<void> => {
    const { method, path } = HomeRouter.recommendKeywords;
    // 백엔드 KeywordCreateRequest는 names 배열을 받음
    // koName과 enName을 합쳐서 전달 (예: "리액트 (React)" 또는 "React" 형식)
    const names = keywords.map((kw) => {
      if (kw.koName && kw.enName) {
        return `${kw.koName} (${kw.enName})`;
      }
      return kw.koName || kw.enName;
    });
    
    await apiClient.request<ApiResponse<void>>({
      url: path,
      method,
      data: {
        names,
      },
    });
  },
} as const;


