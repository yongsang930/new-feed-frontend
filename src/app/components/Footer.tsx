import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Footer() {
  return (
    <React.Fragment>
      <Divider />
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          py: { xs: 2, sm: 3 },
          textAlign: { sm: 'center', md: 'left' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: { xs: 0, sm: 0 },
            width: '100%',
          }}
        >
          <div>
            <Link 
              color="text.secondary" 
              variant="body2" 
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              E-mail: yongsang930@naver.com
            </Link>
          </div>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ justifyContent: 'left', color: 'text.secondary' }}
          >
            <IconButton
              color="inherit"
              size="small"
              href="https://github.com/yongsang930/new-feed-backend"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              sx={{ alignSelf: 'center' }}
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://dev-centralpark.tistory.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Tistory Blog"
              sx={{ 
                alignSelf: 'center',
                padding: '8px',
                '& img': {
                  width: 24,
                  height: 24,
                }
              }}
            >
              <img 
                src="https://t1.daumcdn.net/tistory_admin/top_v2/tistory-apple-touch-favicon.png" 
                alt="Tistory Blog"
              />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.notion.so/RSS-IT-v-1-0-2d04f9e9a000819b8e5dfb88f0b02318"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Notion"
              sx={{ 
                alignSelf: 'center',
                padding: '8px',
                '& img': {
                  width: 24,
                  height: 24,
                }
              }}
            >
              <img 
                src="https://www.notion.so/images/logo-ios.png" 
                alt="Notion"
              />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </React.Fragment>
  );
}
