export const HomeRouter = {
  posts: {
    method: 'GET',
    path: '/api/posts',
  },
  keywords: {
    method: 'GET',
    path: '/api/keywords',
  },
  me: {
    method: 'GET',
    path: '/api/user/me',
  },
} as const;


