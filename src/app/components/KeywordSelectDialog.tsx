import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useKeywords, useUpdateUserKeywords } from '../apis/home/useHome';
import { useQueryClient } from '@tanstack/react-query';
import { isGuest } from '../utils/auth';
import type { Keyword } from '../apis/home/RestHomeRouter';

interface KeywordSelectDialogProps {
  open: boolean;
  onClose: () => void;
}

const GUEST_KEYWORDS_STORAGE_KEY = 'guestSelectedKeywords';

export default function KeywordSelectDialog({ open, onClose }: KeywordSelectDialogProps) {
  const { data: keywords = [], isLoading: keywordsLoading } = useKeywords();
  const { mutate: updateKeywords, isPending: isUpdating } = useUpdateUserKeywords();
  const queryClient = useQueryClient();
  const guestMode = isGuest(); // Role로 게스트 여부 판단
  
  const [selectedKeywordIds, setSelectedKeywordIds] = React.useState<Set<number>>(new Set());
  const lastOpenStateRef = React.useRef(false); // 이전 open 상태 추적

  // 다이얼로그가 열릴 때만 키워드 선택 상태 초기화 (정말 한 번만)
  React.useEffect(() => {
    // 다이얼로그가 닫혀있으면 플래그 리셋
    if (!open) {
      lastOpenStateRef.current = false;
      return;
    }

    // 이미 이번 오픈에서 초기화했으면 스킵 (닫았다가 다시 열었을 때만 초기화)
    if (lastOpenStateRef.current) {
      return;
    }

    // 키워드가 없으면 스킵
    if (keywords.length === 0) {
      return;
    }

    // 게스트 모드: 로컬스토리지에서만 불러오기 (백엔드 isSelected 무시)
    if (guestMode) {
      const stored = localStorage.getItem(GUEST_KEYWORDS_STORAGE_KEY);
      if (stored) {
        try {
          const storedIds = JSON.parse(stored) as number[];
          setSelectedKeywordIds(new Set(storedIds));
        } catch (e) {
          console.error('로컬스토리지 키워드 파싱 실패', e);
          setSelectedKeywordIds(new Set());
        }
      } else {
        setSelectedKeywordIds(new Set());
      }
    } else {
      // 인증된 사용자: 백엔드에서 selected 필드 제공
      const selectedIds = keywords
        .filter((keyword: Keyword) => {
          return keyword.selected === true;
        })
        .map((keyword: Keyword) => keyword.keywordId);
      
      setSelectedKeywordIds(new Set(selectedIds));
    }

    // 초기화 완료 표시
    lastOpenStateRef.current = true;
  }, [open, keywords.length, guestMode]); // keywords.length만 사용하여 배열 참조 변경 무시

  const handleKeywordToggle = React.useCallback((keywordId: number) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      setSelectedKeywordIds((prev) => {
        const newSet = new Set(prev);
        const wasSelected = newSet.has(keywordId);
        
        if (wasSelected) {
          // disable: Set에서 제거
          newSet.delete(keywordId);
        } else {
          // enable: Set에 추가
          newSet.add(keywordId);
        }
        
        // 게스트 모드: 로컬스토리지에 즉시 저장/삭제
        if (guestMode) {
          const idsArray = Array.from(newSet);
          if (idsArray.length > 0) {
            localStorage.setItem(GUEST_KEYWORDS_STORAGE_KEY, JSON.stringify(idsArray));
          } else {
            // 선택된 키워드가 없으면 로컬스토리지에서 삭제
            localStorage.removeItem(GUEST_KEYWORDS_STORAGE_KEY);
          }
        }
        
        return newSet;
      });
    };
  }, [guestMode]);

  const handleComplete = () => {
    const keywordIdsArray = Array.from(selectedKeywordIds);
    
    if (guestMode) {
      // 게스트: 로컬스토리지에 저장하고 posts 필터링 요청
      if (keywordIdsArray.length > 0) {
        localStorage.setItem(GUEST_KEYWORDS_STORAGE_KEY, JSON.stringify(keywordIdsArray));
      } else {
        localStorage.removeItem(GUEST_KEYWORDS_STORAGE_KEY);
      }
      
      // 커스텀 이벤트 발생 (같은 탭에서 변경 감지)
      window.dispatchEvent(new Event('guestKeywordsUpdated'));
      
      // posts 쿼리 무효화하여 keywordIds로 재조회
      // keywordIdsArray가 비어있으면 undefined로 전달되어 모든 posts를 가져옴
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      onClose();
    } else {
      // 인증된 사용자: 서버에 저장
      updateKeywords(keywordIdsArray, {
        onSuccess: () => {
          // 키워드 업데이트 후 posts 재조회 (useUpdateUserKeywords에서 이미 invalidateQueries 호출하지만 확실히 하기 위해)
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          onClose();
        },
      });
    }
  };

  const isLoading = keywordsLoading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          구독 키워드 선택
        </Typography>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              py: 2,
            }}
          >
            {keywords.map((keyword: Keyword) => {
              const isSelected = selectedKeywordIds.has(keyword.keywordId);
              // 한글 이름 우선, 없으면 영어 이름 사용
              const displayName = keyword.koName || keyword.enName || 'Unknown';
              
              return (
                <Chip
                  key={keyword.keywordId}
                  label={displayName}
                  onClick={handleKeywordToggle(keyword.keywordId)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    height: 40,
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: isSelected
                        ? 'primary.dark'
                        : 'action.hover',
                    },
                  }}
                />
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isUpdating || isLoading}>
          취소
        </Button>
        <Button
          onClick={handleComplete}
          variant="contained"
          disabled={isUpdating || isLoading}
        >
          {isUpdating ? <CircularProgress size={20} /> : '완료'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

