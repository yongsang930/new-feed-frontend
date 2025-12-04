import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import Sitemark from './SitemarkIcon';
import KeywordSelectDialog from './KeywordSelectDialog';
import KeywordRecommendDialog from './KeywordRecommendDialog';
import ColorModeSelect from '../theme/ColorModeSelect';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

export default function AppAppBar() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [keywordDialogOpen, setKeywordDialogOpen] = React.useState(false);
  const [recommendDialogOpen, setRecommendDialogOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleKeywordButtonClick = () => {
    setKeywordDialogOpen(true);
  };

  const handleRecommendButtonClick = () => {
    setRecommendDialogOpen(true);
  };

  const handleLogout = () => {
    // localStorage에서 토큰 및 Role 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    // 로그인 화면으로 이동
    navigate('/login');
    // Drawer가 열려있으면 닫기
    setOpen(false);
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <Sitemark />
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={handleKeywordButtonClick}
              >
                나의 키워드
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={handleRecommendButtonClick}
              >
                추천 키워드
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={handleRecommendButtonClick}
              >
                설계 내용
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Button
              color="primary"
              variant="text"
              size="small"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
            <ColorModeSelect />
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <ColorModeSelect />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: 'var(--template-frame-height, 0px)',
                },
              }}
            >
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
          <KeywordSelectDialog
            open={keywordDialogOpen}
            onClose={() => setKeywordDialogOpen(false)}
          />
          <KeywordRecommendDialog
            open={recommendDialogOpen}
            onClose={() => setRecommendDialogOpen(false)}
          />
        </AppBar>
      );
    }
