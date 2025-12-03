import { useQuery } from '@tanstack/react-query';
import { RestHomeRouter } from './RestHomeRouter';

export const usePosts = () =>
  useQuery({
    queryKey: ['posts'],
    queryFn: RestHomeRouter.getPosts,
  });

export const useKeywords = () =>
  useQuery({
    queryKey: ['keywords'],
    queryFn: RestHomeRouter.getKeywords,
  });

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: RestHomeRouter.getMe,
  });


