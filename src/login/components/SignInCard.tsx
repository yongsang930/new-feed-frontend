import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
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
          onClick={() => alert('구글 계정으로 로그인')}
          startIcon={<GoogleIcon />}
        >
          구글 계정으로 로그인
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => alert('Github 계정으로 로그인')}
          startIcon={<GitIcon />}
        >
          Github 계정으로 로그인
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => alert('Guest로 로그인')}
        >
          Guest로 로그인
        </Button>
      </Box>
    </Card>
  );
}
