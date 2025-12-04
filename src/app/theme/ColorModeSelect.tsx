import * as React from 'react';
import { useColorScheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectProps } from '@mui/material/Select';

export default function ColorModeSelect(props: SelectProps) {
  const { mode, setMode } = useColorScheme();
  const selectRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (selectRef.current) {
      // 모든 SVG 아이콘 찾아서 숨기기
      const svgIcons = selectRef.current.querySelectorAll('svg');
      svgIcons.forEach((svg) => {
        svg.style.display = 'none';
      });
      
      // MutationObserver로 동적으로 추가되는 아이콘도 감지
      const observer = new MutationObserver(() => {
        const icons = selectRef.current?.querySelectorAll('svg');
        icons?.forEach((svg) => {
          svg.style.display = 'none';
        });
      });
      
      observer.observe(selectRef.current, {
        childList: true,
        subtree: true,
      });
      
      return () => observer.disconnect();
    }
  }, [mode]);
  
  if (!mode) {
    return null;
  }
  const { sx, ...otherProps } = props;
  
  return (
    <Select
      ref={selectRef}
      value={mode}
      onChange={(event) =>
        setMode(event.target.value as 'system' | 'light' | 'dark')
      }
      SelectDisplayProps={{
        // @ts-ignore
        'data-screenshot': 'toggle-mode',
      }}
      IconComponent={() => null}
      sx={{
        '& .MuiSelect-icon': {
          display: 'none !important',
          visibility: 'hidden !important',
          opacity: '0 !important',
          width: '0 !important',
          height: '0 !important',
        },
        '& .MuiSelect-iconOutlined': {
          display: 'none !important',
          visibility: 'hidden !important',
          opacity: '0 !important',
          width: '0 !important',
          height: '0 !important',
        },
        '& .MuiSvgIcon-root': {
          display: 'none !important',
          visibility: 'hidden !important',
          opacity: '0 !important',
          width: '0 !important',
          height: '0 !important',
        },
        '& svg': {
          display: 'none !important',
          visibility: 'hidden !important',
          opacity: '0 !important',
          width: '0 !important',
          height: '0 !important',
        },
        ...sx,
      }}
      {...otherProps}
    >
      <MenuItem value="system">System</MenuItem>
      <MenuItem value="light">Light</MenuItem>
      <MenuItem value="dark">Dark</MenuItem>
    </Select>
  );
}
