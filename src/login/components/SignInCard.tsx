import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useGuestLogin } from '../../app/apis/account/useLogin';
import type { GuestLoginResponse } from '../../app/apis/account/LoginRouter';
import { useMessage } from '../../app/hooks/useMessage';
import { GoogleIcon, SitemarkIcon, GitIcon } from './CustomIcons';

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
  const { mutate: signInAsGuest, isPending } = useGuestLogin({
    onSuccess: (data: GuestLoginResponse) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userRole', data.role);
      message.success('Guest 로그인 성공');
      console.log('Guest 로그인 응답', data);
      navigate('/main');
    },
    onError: (error: unknown) => {
      console.error('Guest 로그인 실패', error);
      message.error('게스트 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    },
  });

  const handleGuestLogin = () => {
    signInAsGuest();
  };

  return (
    <Card variant="outlined" style={{padding:'80px 20px'}}>
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <SitemarkIcon />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        style={{lineHeight : '2.5'}}
      >
        로그인
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => message.info('구글 계정으로 로그인')}
          startIcon={<GoogleIcon />}
        >
          구글 계정으로 로그인
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => message.info('Github 계정으로 로그인')}
          startIcon={<GitIcon />}
        >
          Github 계정으로 로그인
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGuestLogin}
          disabled={isPending}
        >
          {isPending ? '로그인 중...' : 'Guest로 로그인'}
        </Button>
      </Box>
    </Card>
  );
}
