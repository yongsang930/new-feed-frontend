import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface ProjectDescriptionDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ImageItem {
  src: string;
  alt: string;
  title: string;
}

const images: ImageItem[] = [
  {
    src: '/프로젝트 설계 파이프라인.png',
    alt: '프로젝트 설계 파이프라인',
    title: 'NewFeed 서비스 아키텍처',
  },
  {
    src: '/CICD 흐름.png',
    alt: 'CICD 흐름',
    title: 'CI/CD 파이프라인',
  },
];

export default function ProjectDescriptionDialog({
  open,
  onClose,
}: ProjectDescriptionDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 다이얼로그가 열릴 때마다 첫 번째 이미지로 리셋
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
    }
  }, [open]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[currentIndex];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {currentImage.title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
          }}
        >
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 2,
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor:
                  index === currentIndex ? 'primary.main' : 'action.disabled',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

