import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AppAppBar from '../components/AppAppBar';
import MainContent from '../components/MainContent';
import Footer from '../components/Footer';

export default function MainPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppAppBar />
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flex: 1,
          py: { xs: 4, sm: 6, md: 8 },
          mt: 'var(--template-frame-height, 0px)',
        }}
      >
        <MainContent />
      </Container>
      <Footer />
    </Box>
  );
}
