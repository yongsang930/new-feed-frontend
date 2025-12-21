import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import { usePostsPaginated, useKeywords } from '../apis/home/useHome';
import { isGuest } from '../utils/auth';
import type { Post } from '../apis/home/RestHomeRouter';

// ==================== 상수 정의 ====================
const CARD_CONFIG = {
  height: 400,
  padding: 20, // 여백 증가
  authorPadding: 14, // 여백 증가
  gap: {
    content: 8, // 간격 증가
    cards: 2,
    author: 2,
  },
  avatar: {
    size: 24,
    maxCount: 3,
  },
  text: {
    titleLines: 2,
  },
} as const;

const GRID_CONFIG = {
  columns: 12,
  spacing: 2,
  cardSize: { xs: 12, md: 4 },
} as const;

const LAYOUT_CONFIG = {
  loadingMinHeight: 400,
  sectionGap: 4,
  authorPadding: 16,
  infiniteScrollLimit: 30, // 무한 스크롤 최대 개수
  itemsPerPage: 9, // 페이징당 아이템 수 (9개씩)
  initialDisplayCount: 6, // 초기 표시 개수
  loadMoreCount: 6, // 무한 스크롤 시 추가 로드 개수
} as const;

// ==================== 타입 정의 ====================
type CardData = {
  tag: string;
  title: string;
  content: string;
  summary?: string;
  link?: string;
  authors: Array<{ name: string; avatar?: string }>;
  publishedAt?: string;
  region?: string;
  keywordIds?: number[]; // Post에 연결된 키워드 ID 배열
};

// ==================== Styled Components ====================
const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: `${CARD_CONFIG.height}px`,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  borderRadius: '12px',
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
  boxShadow: (theme.vars || theme).shadows[2],
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: (theme.vars || theme).shadows[8],
    borderColor: (theme.vars || theme).palette.primary.main,
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '2px',
  },
}));

const StyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: CARD_CONFIG.gap.content,
  padding: CARD_CONFIG.padding,
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  // 스크롤바 기본 상태: 숨김
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'transparent',
    borderRadius: '4px',
    transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
  },
  // 호버 시 스크롤바 표시 (부드러운 애니메이션)
  '&:hover::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.2)',
    backgroundClip: 'padding-box',
  },
  '&:hover::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(0, 0, 0, 0.4)',
    backgroundClip: 'padding-box',
  },
  // 다크 모드 지원 (시스템 설정)
  '@media (prefers-color-scheme: dark)': {
    '&:hover::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.2)',
      backgroundClip: 'padding-box',
    },
    '&:hover::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(255, 255, 255, 0.4)',
      backgroundClip: 'padding-box',
    },
  },
  '&:last-child': {
    paddingBottom: CARD_CONFIG.padding,
  },
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  fontSize: '0.875rem',
  lineHeight: 1.6,
  color: (theme.vars || theme).palette.text.secondary,
}));

const StyledHtmlTypography = styled(Box)({
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'text.secondary',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  minWidth: 0, // flexbox에서 overflow 방지
  '& p': {
    margin: 0,
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
    wordBreak: 'break-word',
  },
  '& *': {
    fontSize: 'inherit !important',
    lineHeight: 'inherit !important',
    color: 'inherit !important',
    wordBreak: 'break-word !important',
    boxSizing: 'border-box !important',
  },
  '& img': {
    display: 'block',
    maxWidth: '100% !important',
    height: 'auto !important',
    width: 'auto !important',
    margin: '4px 0',
    objectFit: 'contain',
  },
  '& a': {
    color: 'inherit',
    textDecoration: 'none',
    wordBreak: 'break-word',
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    fontSize: 'inherit',
    fontWeight: 'normal',
    margin: 0,
    wordBreak: 'break-word',
  },
});

const SummaryTooltipBox = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.75)'
    : 'rgba(0, 0, 0, 0.75)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[12],
  backdropFilter: 'blur(8px)',
}));

const StyledTitleTypography = styled(Typography)(({ theme }) => ({
  display: 'block',
  width: '100%',
  maxWidth: '100%',
  wordBreak: 'break-all',
  overflowWrap: 'anywhere',
  whiteSpace: 'normal',
  overflow: 'visible',
  hyphens: 'none',
  boxSizing: 'border-box',
  wordWrap: 'break-word',
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontWeight: 600,
  fontSize: '1.125rem',
  lineHeight: 1.5,
  letterSpacing: '-0.01em',
  color: (theme.vars || theme).palette.text.primary,
  marginBottom: '8px',
  // Typography 기본 스타일 오버라이드
  '&.MuiTypography-root': {
    wordBreak: 'break-all',
    overflowWrap: 'anywhere',
    whiteSpace: 'normal',
  },
}));

// ==================== 컴포넌트 ====================
function Author({ 
  authors, 
  publishedAt,
  region
}: { 
  authors?: Array<{ name: string; avatar?: string }>; 
  publishedAt?: string;
  region?: string;
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        gap: CARD_CONFIG.gap.author,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${CARD_CONFIG.authorPadding}px`,
        borderTop: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.02)' 
          : 'rgba(0, 0, 0, 0.02)',
      })}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}
      >
        {authors && authors.length > 0 ? (
          <>
            <AvatarGroup max={CARD_CONFIG.avatar.maxCount}>
              {authors.map((author, index) => (
                <Avatar
                  key={index}
                  alt={author.name}
                  src={author.avatar}
                  sx={{ width: CARD_CONFIG.avatar.size, height: CARD_CONFIG.avatar.size }}
                >
                  {author.name.charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
            <Typography variant="caption">
              {authors.map((author) => author.name).join(', ')}
            </Typography>
          </>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {region || 'Unknown'}
          </Typography>
        )}
      </Box>
      {publishedAt && (
        <Typography variant="caption" color="text.secondary">
          {formatDate(publishedAt)}
        </Typography>
      )}
    </Box>
  );
}

export function Search() {
  return (
    <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search…"
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{
          'aria-label': 'search',
        }}
      />
    </FormControl>
  );
}

// HTML 태그가 포함되어 있는지 확인
const isHtmlContent = (text: string): boolean => {
  if (!text) return false;
  // HTML 태그 패턴 확인
  const htmlTagPattern = /<[^>]+>/;
  return htmlTagPattern.test(text);
};

// 카드 컴포넌트
function PostCard({
  card,
  isFocused,
  onFocus,
  onBlur,
  region,
}: {
  card: CardData;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  region?: string;
}) {
  const handleClick = () => {
    if (card.link) {
      window.open(card.link, '_blank', 'noopener,noreferrer');
    }
  };

  const contentIsHtml = isHtmlContent(card.content);
  const summaryIsHtml = card.summary ? isHtmlContent(card.summary) : false;
  const [showSummaryTooltip, setShowSummaryTooltip] = React.useState(false);

  return (
    <StyledCard
      variant="outlined"
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={handleClick}
      tabIndex={0}
      className={isFocused ? 'Mui-focused' : ''}
      onMouseEnter={() => {
        setShowSummaryTooltip(true);
      }}
      onMouseLeave={() => setShowSummaryTooltip(false)}
      sx={{ position: 'relative' }}
    >
        <StyledCardContent sx={{ flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, position: 'relative' }}>
          <StyledTitleTypography 
            gutterBottom 
            variant="h6"
            sx={{
              wordBreak: 'break-all',
              overflowWrap: 'anywhere',
              whiteSpace: 'normal',
            }}
          >
            {card.title || 'Untitled'}
          </StyledTitleTypography>
          {card.content ? (
            contentIsHtml ? (
              <StyledHtmlTypography
                sx={{ mb: 1 }}
                dangerouslySetInnerHTML={{ __html: card.content }}
              />
            ) : (
              <StyledTypography variant="body2" color="text.secondary" gutterBottom>
                {card.content}
              </StyledTypography>
            )
          ) : (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontStyle: 'italic',
              }}
            >
              {card.link || 'No content'}
            </Typography>
          )}
          {showSummaryTooltip && (
            <SummaryTooltipBox
              sx={{
                position: 'absolute',
                bottom: '60px',
                left: '16px',
                right: '16px',
                zIndex: 10,
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              <Typography
                variant="caption"
                sx={(theme) => ({
                  display: 'block',
                  fontWeight: 600,
                  mb: 1,
                  color: (theme.vars || theme).palette.primary.main,
                })}
              >
                AI 요약 내용
              </Typography>
              {card.summary ? (
                summaryIsHtml ? (
                  <StyledHtmlTypography
                    sx={{ fontSize: '0.75rem', color: 'white' }}
                    dangerouslySetInnerHTML={{ __html: card.summary }}
                  />
                ) : (
                  <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', color: 'white' }}>
                    {card.summary}
                  </Typography>
                )
              ) : (
                <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', color: 'white' }}>
                  AI로 분석중입니다.
                </Typography>
              )}
            </SummaryTooltipBox>
          )}
        </StyledCardContent>
        <Author 
          authors={card.authors} 
          publishedAt={card.publishedAt}
          region={region}
        />
      </StyledCard>
  );
}

const GUEST_KEYWORDS_STORAGE_KEY = 'guestSelectedKeywords';

type SortOption = 'latest' | 'oldest' | 'title';

export default function MainContent() {
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(null);
  const [paginationPage, setPaginationPage] = React.useState(0); // 페이징 페이지 (백엔드는 page 0부터 시작)
  const [selectedKeywordId, setSelectedKeywordId] = React.useState<number | 'all'>('all'); // 선택된 키워드 ID 또는 'all'
  const [sortBy] = React.useState<SortOption>('latest');
  const guestMode = isGuest(); // Role로 게스트 여부 판단
  
  // 게스트일 때만 로컬스토리지에서 키워드 가져오기
  const [guestKeywordIds, setGuestKeywordIds] = React.useState<number[] | undefined>(undefined);
  
  // 인증된 사용자의 선택한 키워드 가져오기
  const { data: keywords = [] } = useKeywords();
  
  // 선택된 키워드 목록 (필터 Chip으로 표시)
  const selectedKeywords = React.useMemo(() => {
    // 활성화된 키워드만 필터링 (isActive가 false가 아닌 것만)
    const activeKeywords = keywords.filter((keyword) => keyword.isActive !== false);

    if (guestMode) {
      // 게스트 모드: 상태에 저장된 guestKeywordIds를 사용해 매칭
      if (guestKeywordIds && guestKeywordIds.length > 0) {
        return activeKeywords.filter((keyword) =>
          guestKeywordIds.includes(keyword.keywordId)
        );
      }
      return [];
    }

    // 인증된 사용자: selected === true인 키워드만
    return activeKeywords.filter((keyword) => keyword.selected === true);
  }, [keywords, guestMode, guestKeywordIds]);
  
  const authenticatedKeywordIds = React.useMemo(() => {
    if (guestMode) return undefined;
    // 활성화된 키워드 중에서 selected === true인 것만
    const selectedIds = keywords
      .filter((keyword) => keyword.isActive !== false && keyword.selected === true)
      .map((keyword) => keyword.keywordId);
    return selectedIds.length > 0 ? selectedIds : undefined;
  }, [keywords, guestMode]);
  
  React.useEffect(() => {
    if (!guestMode) {
      setGuestKeywordIds(undefined);
      return;
    }
    
    const loadGuestKeywords = () => {
      const stored = localStorage.getItem(GUEST_KEYWORDS_STORAGE_KEY);
      if (stored) {
        try {
          const ids = JSON.parse(stored) as number[];
          setGuestKeywordIds(ids.length > 0 ? ids : undefined);
        } catch (e) {
          console.error('로컬스토리지 키워드 파싱 실패', e);
          setGuestKeywordIds(undefined);
        }
      } else {
        setGuestKeywordIds(undefined);
      }
    };
    
    // 초기 로드
    loadGuestKeywords();
    
    // storage 이벤트 리스너 (다른 탭에서 변경된 경우 감지)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GUEST_KEYWORDS_STORAGE_KEY) {
        loadGuestKeywords();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 커스텀 이벤트 리스너 (같은 탭에서 변경된 경우 감지)
    const handleCustomStorageChange = () => {
      loadGuestKeywords();
    };
    
    window.addEventListener('guestKeywordsUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('guestKeywordsUpdated', handleCustomStorageChange);
    };
  }, [guestMode]);

  // 페이징용 (전체 데이터를 페이징으로 처리)
  // 게스트는 guestKeywordIds, 인증된 사용자는 authenticatedKeywordIds 사용
  const keywordIdsToUse = guestMode ? guestKeywordIds : authenticatedKeywordIds;
  
  // 키워드가 변경되면 첫 페이지로 리셋
  React.useEffect(() => {
    setPaginationPage(0); // 백엔드는 page 0부터 시작
  }, [keywordIdsToUse]);
  
  const {
    data: paginationData,
    isLoading: paginationLoading,
  } = usePostsPaginated(paginationPage, LAYOUT_CONFIG.itemsPerPage, keywordIdsToUse);
  
  const handleFocus = (index: number) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  // 페이징 데이터 변환
  const paginationCards: CardData[] = React.useMemo(() => {
    if (!paginationData || !paginationData.content || !Array.isArray(paginationData.content)) return [];
    
    return paginationData.content.map((post: Post) => ({
      tag: post.tag || post.title || 'General',
      title: post.title || 'Untitled',
      content: post.content || post.description || '',
      summary: post.summary,
      link: post.link,
      authors: post.authors || [],
      publishedAt: post.published_at || post.createdAt,
      region: post.region,
      keywordIds: post.keywords?.map((kw) => kw.keyword_id) || [], // Post에 연결된 키워드 ID 배열
    }));
  }, [paginationData]);

  // 키워드별 게시물 개수 계산
  const keywordPostCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};

    // 현재 페이지의 카드 전체를 사용
    paginationCards.forEach((card) => {
      if (card.keywordIds && card.keywordIds.length > 0) {
        card.keywordIds.forEach((keywordId) => {
          counts[keywordId] = (counts[keywordId] || 0) + 1;
        });
      }
    });

    return counts;
  }, [paginationCards, selectedKeywordId]);

  // 게시물 0개인 키워드는 숨기고, 개수순으로 정렬
  const filteredSelectedKeywords = React.useMemo(() => {
    // 게시물 개수 0개는 제외
    const filtered = selectedKeywords.filter((keyword) => {
      const count = keywordPostCounts[keyword.keywordId] || 0;
      return count > 0;
    });

    // 게시물 개수순으로 정렬 (내림차순: 많은 순서대로)
    return filtered.sort((a, b) => {
      const countA = keywordPostCounts[a.keywordId] || 0;
      const countB = keywordPostCounts[b.keywordId] || 0;
      return countB - countA;
    });
  }, [selectedKeywords, keywordPostCounts]);

  const isLoading = paginationLoading;
  
  // 필터링 및 정렬된 카드들 계산
  const displayedCards = React.useMemo(() => {
    let filtered = [...paginationCards];
    
    // 키워드 필터링
    if (selectedKeywordId !== 'all') {
      filtered = filtered.filter((card) => {
        // Post의 keywordIds에 선택한 키워드 ID가 포함되어 있는지 확인
        return card.keywordIds?.includes(selectedKeywordId as number) || false;
      });
    }
    
    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          // 최신순 (publishedAt 내림차순)
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        case 'oldest':
          // 오래된순 (publishedAt 오름차순)
          const dateAOld = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateBOld = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateAOld - dateBOld;
        case 'title':
          // 제목순 (알파벳 순)
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [paginationCards, selectedKeywordId, sortBy]);
  
  // 필터 변경 핸들러
  const handleKeywordClick = (keywordId: number | 'all') => {
    setSelectedKeywordId(keywordId);
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    // value는 UI 페이지 번호 (1부터 시작), 백엔드는 0부터 시작하므로 -1
    setPaginationPage(value - 1);
    // 페이지 이동 시 필터 선택 해제 (모든 키워드)
    setSelectedKeywordId('all');
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 백엔드에서 받은 총 페이지 수 사용 (UI는 1-based)
  const totalPages = paginationData?.totalPages || 0;
  const currentPageUI = paginationPage + 1; // 백엔드 page(0-based)를 UI page(1-based)로 변환
  
  // 페이지 그룹 계산 (요구사항에 따른 정확한 계산)
  // groupStart = Math.floor((currentPage - 1) / 10) * 10 + 1
  // groupEnd = Math.min(groupStart + 9, totalPages)
  const groupStart = Math.floor((currentPageUI - 1) / 10) * 10 + 1;
  const groupEnd = Math.min(groupStart + 9, totalPages);
  
  // 버튼 비활성화 조건
  const isFirstPage = currentPageUI === 1;
  const isLastPage = currentPageUI === totalPages;

  if (isLoading && paginationCards.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: `${LAYOUT_CONFIG.loadingMinHeight}px` 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (displayedCards.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: LAYOUT_CONFIG.sectionGap }}>
        <div>
          <Typography variant="h2" gutterBottom>
          News Feed
          </Typography>
          <Typography>최신 IT 뉴스와 기술 트렌드를 편리하게 확인할 수 있는 개인화된 뉴스 피드입니다.
          </Typography>
        </div>
        <Typography variant="body1" color="text.secondary">
          게시물이 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: LAYOUT_CONFIG.sectionGap }}>
      <Box sx={{ marginTop: '24px', mb: 3, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: '1.75rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1.5,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '3px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '2px',
            },
          }}
        >
          Tech Blog
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: '0.95rem',
            lineHeight: 1.7,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          최신 IT 뉴스와 기술 트렌드를 편리하게 확인할 수 있는 개인화된 뉴스 피드입니다.
        </Typography>
      </Box>
      
      {/* 필터 및 정렬 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 키워드 필터 */}
        {filteredSelectedKeywords.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 3,
              pb: 1,
            }}
          >
            <Chip 
              onClick={() => handleKeywordClick('all')} 
              size="medium" 
              label="전체"
              color={selectedKeywordId === 'all' ? 'primary' : 'default'}
              variant={selectedKeywordId === 'all' ? 'filled' : 'outlined'}
              sx={{
                cursor: 'pointer',
              }}
            />
            {filteredSelectedKeywords.map((keyword) => {
              const isSelected = selectedKeywordId === keyword.keywordId;
              // en_name 우선 표기
              const displayName = keyword.enName || keyword.koName || 'Unknown';
              const postCount = keywordPostCounts[keyword.keywordId] || 0;
              const labelText = `${displayName}(${postCount})`;
              return (
                <Chip
                  key={keyword.keywordId}
                  onClick={() => handleKeywordClick(keyword.keywordId)}
                  size="medium"
                  label={labelText}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    backgroundColor: isSelected ? undefined : 'transparent',
                    border: isSelected ? undefined : 'none',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </Box>
        )}
      </Box>
      
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'row',
          gap: 1,
          width: { xs: '100%', md: 'fit-content' },
          overflow: 'auto',
        }}
      >
        <Search />
        <IconButton size="small" aria-label="RSS feed">
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>
      <Grid container spacing={GRID_CONFIG.spacing} columns={GRID_CONFIG.columns}>
        {displayedCards.map((card, index) => (
          <Grid key={index} size={GRID_CONFIG.cardSize}>
            <PostCard
              card={card}
              isFocused={focusedCardIndex === index}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              region={card.region}
            />
          </Grid>
        ))}
      </Grid>
      {/* 페이징 */}
      {displayedCards.length > 0 && totalPages > 0 && (
        <Stack spacing={2} sx={{ alignItems: 'center', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* 맨앞 버튼 « */}
            <IconButton
              onClick={() => {
                handlePageChange({} as React.ChangeEvent<unknown>, 1);
              }}
              size="small"
              sx={{ minWidth: '40px' }}
              disabled={isFirstPage}
              aria-label="맨앞 페이지"
            >
              <Typography variant="body2">«</Typography>
            </IconButton>
            
            {/* 이전 버튼 ‹ */}
            <IconButton
              onClick={() => {
                handlePageChange({} as React.ChangeEvent<unknown>, currentPageUI - 1);
              }}
              size="small"
              sx={{ minWidth: '40px' }}
              disabled={isFirstPage}
              aria-label="이전 페이지"
            >
              <Typography variant="body2">‹</Typography>
            </IconButton>
            
            {/* 페이지 번호 버튼 (groupStart ~ groupEnd) */}
            {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i)
              .map((pageNum) => (
                <IconButton
                  key={pageNum}
                  onClick={() => handlePageChange({} as React.ChangeEvent<unknown>, pageNum)}
                  size="small"
                  sx={{
                    minWidth: '40px',
                    height: '40px',
                    backgroundColor: currentPageUI === pageNum ? 'primary.main' : 'transparent',
                    color: currentPageUI === pageNum ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      backgroundColor: currentPageUI === pageNum ? 'primary.dark' : 'action.hover',
                    },
                    '&:disabled': {
                      backgroundColor: currentPageUI === pageNum ? 'primary.main' : 'transparent',
                    },
                  }}
                  aria-label={`페이지 ${pageNum}`}
                >
                  <Typography variant="body2" fontWeight={currentPageUI === pageNum ? 'bold' : 'normal'}>
                    {pageNum}
                  </Typography>
                </IconButton>
              ))}
            
            {/* 다음 버튼 › */}
            <IconButton
              onClick={() => {
                handlePageChange({} as React.ChangeEvent<unknown>, currentPageUI + 1);
              }}
              size="small"
              sx={{ minWidth: '40px' }}
              disabled={isLastPage}
              aria-label="다음 페이지"
            >
              <Typography variant="body2">›</Typography>
            </IconButton>
            
            {/* 맨뒤 버튼 » */}
            <IconButton
              onClick={() => {
                handlePageChange({} as React.ChangeEvent<unknown>, totalPages);
              }}
              size="small"
              sx={{ minWidth: '40px' }}
              disabled={isLastPage}
              aria-label="맨뒤 페이지"
            >
              <Typography variant="body2">»</Typography>
            </IconButton>
          </Box>
          {/* 그룹 정보 표시 */}
          <Typography variant="body2" color="text.secondary">
            {groupStart}-{groupEnd} 페이지
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
