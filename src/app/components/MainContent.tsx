import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
  itemsPerPage: 30, // 페이징당 아이템 수 (30개씩)
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
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.4,
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
        if (card.summary) {
          setShowSummaryTooltip(true);
        }
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
          {showSummaryTooltip && card.summary && (
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
              {summaryIsHtml ? (
                <StyledHtmlTypography
                  sx={{ fontSize: '0.75rem', color: 'white' }}
                  dangerouslySetInnerHTML={{ __html: card.summary }}
                />
              ) : (
                <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', color: 'white' }}>
                  {card.summary}
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

export default function MainContent() {
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(null);
  const [paginationPage, setPaginationPage] = React.useState(1); // 페이징 페이지 (page 1부터 시작, 30개 이후)
  const guestMode = isGuest(); // Role로 게스트 여부 판단
  
  // 게스트일 때만 로컬스토리지에서 키워드 가져오기
  const [guestKeywordIds, setGuestKeywordIds] = React.useState<number[] | undefined>(undefined);
  
  // 인증된 사용자의 선택한 키워드 가져오기
  const { data: keywords = [] } = useKeywords();
  const authenticatedKeywordIds = React.useMemo(() => {
    if (guestMode) return undefined;
    const selectedIds = keywords
      .filter((keyword) => keyword.selected === true)
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
  
  console.log(paginationData);
  const handleFocus = (index: number) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  // 페이징 데이터 변환
  const paginationCards: CardData[] = React.useMemo(() => {
    if (!paginationData || !Array.isArray(paginationData)) return [];
    
    return paginationData.map((post: Post) => ({
      tag: post.tag || post.title || 'General',
      title: post.title || 'Untitled',
      content: post.content || post.description || '',
      summary: post.summary,
      link: post.link,
      authors: post.authors || [],
      publishedAt: post.published_at || post.createdAt,
      region: post.region,
    }));
  }, [paginationData]);

  const isLoading = paginationLoading;
  
  // 표시할 카드들 계산 - 페이징만 사용
  const displayedCards = paginationCards;

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPaginationPage(value);
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 총 페이지 수 계산
  // 백엔드에서 총 개수를 알 수 없으므로, 현재 페이지에 데이터가 있으면 다음 페이지도 있다고 가정
  const hasMorePaginationPages = paginationCards.length === LAYOUT_CONFIG.itemsPerPage;
  
  // 실제 최대 페이지 수 계산 (UI는 1부터 시작, 백엔드는 0부터 시작)
  // 현재 페이지에 데이터가 있으면:
  //   - 30개면 다음 페이지도 있을 수 있음 (paginationPage + 1 + 1 = paginationPage + 2)
  //   - 30개 미만이면 현재 페이지가 마지막 (paginationPage + 1)
  // 현재 페이지에 데이터가 없으면:
  //   - 현재 페이지가 마지막 (paginationPage + 1)
  const maxPageUI = paginationCards.length > 0 
    ? (hasMorePaginationPages ? paginationPage + 2 : paginationPage + 1)
    : paginationPage + 1; // 데이터가 없으면 현재 페이지가 마지막 (UI는 1부터 시작)
  
  // 페이지 그룹 계산 (10개 단위) - UI는 1부터 시작
  const PAGES_PER_GROUP = 10;
  const currentPageUI = paginationPage + 1; // 백엔드 page를 UI page로 변환
  const currentGroup = Math.ceil(currentPageUI / PAGES_PER_GROUP);
  const startPage = (currentGroup - 1) * PAGES_PER_GROUP + 1;
  // 그룹의 마지막 페이지와 실제 최대 페이지 중 작은 값 사용
  const groupEndPage = currentGroup * PAGES_PER_GROUP;
  const endPage = Math.min(groupEndPage, maxPageUI);
  // 실제 존재하는 페이지만 표시
  const totalPagesInGroup = Math.max(1, Math.min(PAGES_PER_GROUP, endPage - startPage + 1));

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
          <Typography variant="h1" gutterBottom>
          News Feed
          </Typography>
          <Typography>Stay in the loop with the latest about our products</Typography>
        </div>
        <Typography variant="body1" color="text.secondary">
          게시물이 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: LAYOUT_CONFIG.sectionGap }}>
      <div style={{ marginTop: '32px' }}>
        <Typography variant="h3" gutterBottom>
        Tech Blog
        </Typography>
        <Typography>  최신 IT 뉴스와 기술 트렌드를 편리하게 확인할 수 있는 개인화된 뉴스 피드입니다.
        </Typography>
      </div>
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
      {displayedCards.length > 0 && (
        <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* 이전 그룹 버튼 */}
            {currentGroup > 1 && (
              <IconButton
                onClick={() => {
                  const prevGroupStartPage = (currentGroup - 2) * PAGES_PER_GROUP + 1;
                  handlePageChange({} as React.ChangeEvent<unknown>, prevGroupStartPage);
                }}
                size="small"
                sx={{ minWidth: '40px' }}
              >
                <Typography variant="body2">‹ 이전</Typography>
              </IconButton>
            )}
            {/* 현재 그룹의 모든 페이지 번호 표시 (최대 페이지까지만) */}
            {Array.from({ length: totalPagesInGroup }, (_, i) => startPage + i)
              .filter((pageNum) => pageNum <= maxPageUI) // 최대 페이지까지만 표시
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
                }}
              >
                <Typography variant="body2" fontWeight={currentPageUI === pageNum ? 'bold' : 'normal'}>
                  {pageNum}
                </Typography>
              </IconButton>
              ))}
            {/* 다음 그룹 버튼 - 실제로 다음 페이지가 있을 때만 표시 */}
            {hasMorePaginationPages && currentPageUI < maxPageUI && (
              <IconButton
                onClick={() => {
                  const nextGroupStartPage = currentGroup * PAGES_PER_GROUP + 1;
                  handlePageChange({} as React.ChangeEvent<unknown>, nextGroupStartPage);
                }}
                size="small"
                sx={{ minWidth: '40px' }}
              >
                <Typography variant="body2">다음 ›</Typography>
              </IconButton>
            )}
          </Box>
          {/* 그룹 정보 표시 */}
          <Typography variant="body2" color="text.secondary">
            {startPage}-{endPage} 페이지
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
