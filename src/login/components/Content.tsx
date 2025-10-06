import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SitemarkIcon } from './CustomIcons';

// 교체를 원하는 아이콘 import
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

const items = [
  {
    // 아이콘만 교체
    icon: <TuneRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: '맞춤형 피드 (Personalized Feed)',
    description:
      '관심있는 키워드를 등록하고, 매일 쏟아지는 기술 뉴스 중 \n나에게 필요한 정보만 받아보세요.',
  },
  {
    // 아이콘만 교체
    icon: <FilterAltOutlinedIcon sx={{ color: 'text.secondary' }} />,
    title: '강력한 필터링 (Powerful Filtering)',
    description:
      '전체, 국내, 해외 등 원하는 정보의 출처를 선택하고, \n중요한 아티클에만 집중할 수 있습니다.',
  },
  {
    // 아이콘만 교체
    icon: <RssFeedRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: '다양한 정보 소스 (Diverse Sources)',
    description:
      '국내외 주요 기술 블로그, IT 미디어의 RSS 피드를 기반으로, 놓치기 \n쉬운 양질의 콘텐츠를 제공합니다.',
  },
  {
    // 아이콘만 교체
    icon: <InsightsRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: '최신 트렌드 (Latest Trends)',
    description:
      '키워드 알림을 통해 AI, 프론트엔드, 클라우드 등 \n빠르게 변화하는 기술 트렌드를 놓치지 마세요.',
  },
];

export default function Content() {
  return (
    <Stack
      sx={{ flexDirection: 'column', alignSelf: 'center', gap: 4, maxWidth: 450}}
    >
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <SitemarkIcon />
      </Box>
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
}
