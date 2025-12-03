import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { usePosts, useKeywords, useMe } from '../apis/home/useHome';

export default function MainPage() {
  const {
    data: posts,
    isLoading: postsLoading,
  } = usePosts();
  const {
    data: keywords,
    isLoading: keywordsLoading,
  } = useKeywords();
  const {
    data: me,
    isLoading: meLoading,
  } = useMe();

  const loading = postsLoading || keywordsLoading || meLoading;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        안녕하세요, {me?.name}님
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          최신 게시물
        </Typography>
        <ul>
          {posts?.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          추천 키워드
        </Typography>
        <ul>
          {keywords?.map((keyword) => (
            <li key={keyword.id}>{keyword.name}</li>
          ))}
        </ul>
      </Box>
    </Box>
  );
}


