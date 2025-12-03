import apiClient from '../client';
import { HomeRouter } from './HomeRouter';

export type Post = {
  id: number;
  title: string;
  content: string;
};

export type Keyword = {
  id: number;
  name: string;
};

export type Me = {
  id: number;
  name: string;
};

export const RestHomeRouter = {
  getPosts: async (): Promise<Post[]> => {
    const { method, path } = HomeRouter.posts;
    const { data } = await apiClient.request<Post[]>({
      url: path,
      method,
    });
    return data;
  },
  getKeywords: async (): Promise<Keyword[]> => {
    const { method, path } = HomeRouter.keywords;
    const { data } = await apiClient.request<Keyword[]>({
      url: path,
      method,
    });
    return data;
  },
  getMe: async (): Promise<Me> => {
    const { method, path } = HomeRouter.me;
    const { data } = await apiClient.request<Me>({
      url: path,
      method,
    });
    return data;
  },
} as const;


