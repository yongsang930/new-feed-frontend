export const HomeRouter = {
  posts: {
    method: 'GET',
    path: '/api/posts/search',
  },
  keywords: {
    method: 'GET',
    path: '/api/keywords',
  },
  userKeywords: {
    method: 'GET',
    path: '/api/user/keywords',
  },
  updateUserKeywords: {
    method: 'POST',
    path: '/api/user/keywords',
  },
  recommendKeywords: {
    method: 'POST',
    path: '/api/keywords/custom',
  },
} as const;


