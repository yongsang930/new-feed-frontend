import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useGuestLogin } from '../../app/apis/account/useLogin';
import type { GuestLoginResponse } from '../../app/apis/account/LoginRouter';
import { useMessage } from '../../app/hooks/useMessage';
import { GoogleIcon, GitIcon } from './CustomIcons';
import SitemarkIcon from '../../app/components/SitemarkIcon';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function SignInCard() {
  const navigate = useNavigate();
  const message = useMessage();
  
  // 로컬스토리지에 토큰이 있는지 확인
  const hasToken = React.useMemo(() => {
    return !!localStorage.getItem('accessToken');
  }, []);
  
  const { mutate: signInAsGuest, isPending } = useGuestLogin({
    onSuccess: (data: GuestLoginResponse) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userRole', data.role);
      message.success('Guest 로그인 성공');
      // 보안: 토큰 정보는 콘솔에 출력하지 않음
      navigate('/main');
    },
    onError: (error: unknown) => {
      console.error('Guest 로그인 실패', error);
      message.error('게스트 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    },
  });

  const handleGuestLogin = () => {
    if (hasToken) {
      // 토큰이 있으면 메인으로 이동
      navigate('/main');
      return;
    }
    signInAsGuest();
  };
  
  const handleGoToMain = () => {
    navigate('/main');
  };

  return (
    <Card variant="outlined" style={{padding:'80px 20px'}}>
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <SitemarkIcon />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ 
          width: '100%', 
          fontSize: 'clamp(2rem, 10vw, 2.15rem)',
          fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", "Roboto", "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
          color: 'text.primary',
        }}
      >
        로그인
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          disabled
          startIcon={<GoogleIcon />}
          sx={{
            fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", "Roboto", "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
            fontWeight: 500,
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em',
            py: 1.5,
            textTransform: 'none',
            borderRadius: 2,
            opacity: 0.5,
            '& .MuiButton-startIcon': {
              opacity: 0.5,
            },
            '& .MuiButton-label': {
              textDecoration: 'line-through',
            },
          }}
        >
          구글 계정으로 로그인
        </Button>
        <Button
          fullWidth
          variant="outlined"
          disabled
          startIcon={<GitIcon />}
          sx={{
            fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", "Roboto", "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
            fontWeight: 500,
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em',
            py: 1.5,
            textTransform: 'none',
            borderRadius: 2,
            opacity: 0.5,
            '& .MuiButton-startIcon': {
              opacity: 0.5,
            },
            '& .MuiButton-label': {
              textDecoration: 'line-through',
            },
          }}
        >
          Github 계정으로 로그인
        </Button>
        {hasToken ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
              py: 2,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", "Roboto", "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
                fontWeight: 500,
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              이미 로그인되어 있습니다
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGoToMain}
              sx={{
                fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", "Roboto", "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
                fontWeight: 500,
                fontSize: '0.9375rem',
                letterSpacing: '-0.01em',
                py: 1.5,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              메인으로 이동
            </Button>
          </Box>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGuestLogin}
            disabled={isPending}
            sx={{
              fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", "Roboto", "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
              fontWeight: 500,
              fontSize: '0.9375rem',
              letterSpacing: '-0.01em',
              py: 1.5,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            {isPending ? '로그인 중...' : 'Guest로 로그인'}
          </Button>
        )}
      </Box>
    </Card>
  );
}
