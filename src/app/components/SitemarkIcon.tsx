import { Box, Typography } from '@mui/material';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';

export default function SitemarkIcon() {
  const handleClick = () => {
    // 메인으로 강제 새로고침하여 페이지/필터 상태 초기화
    window.location.href = '/main';
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mr: 2,
        cursor: 'pointer',
      }}
    >
      <RssFeedRoundedIcon 
        sx={{ 
          fontSize: 28,
          color: 'primary.main',
        }} 
      />
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Tech Feed
      </Typography>
    </Box>
  );
}
