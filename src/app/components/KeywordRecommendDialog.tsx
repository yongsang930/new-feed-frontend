import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRecommendKeywords } from '../apis/home/useHome';
import { useMessage } from '../hooks/useMessage';

interface KeywordRecommendDialogProps {
  open: boolean;
  onClose: () => void;
}

interface KeywordInput {
  koName: string;
  enName: string;
}

interface KeywordError {
  koName?: string;
  enName?: string;
}

const MAX_KEYWORD_LENGTH = 50; // 최대 키워드 길이
const MAX_KEYWORD_COUNT = 5; // 최대 키워드 개수

export default function KeywordRecommendDialog({ open, onClose }: KeywordRecommendDialogProps) {
  const { mutate: recommendKeywords, isPending: isRecommending } = useRecommendKeywords();
  const message = useMessage();
  
  const [keywordInputs, setKeywordInputs] = React.useState<KeywordInput[]>([
    { koName: '', enName: '' },
  ]);
  const [errors, setErrors] = React.useState<KeywordError[]>([]);

  // 다이얼로그가 열릴 때 입력란 초기화
  React.useEffect(() => {
    if (open) {
      setKeywordInputs([{ koName: '', enName: '' }]);
      setErrors([]);
    }
  }, [open]);

  // 입력값 검증 함수
  const validateKeyword = (koName: string, enName: string): KeywordError => {
    const error: KeywordError = {};
    
    // 한글 이름 검증
    const trimmedKoName = koName.trim();
    if (trimmedKoName === '') {
      // 빈 값은 실시간 검증에서 에러로 표시하지 않음 (제출 시에만 검증)
    } else {
      if (trimmedKoName.length > MAX_KEYWORD_LENGTH) {
        error.koName = `한글 이름은 ${MAX_KEYWORD_LENGTH}자 이하여야 합니다.`;
      } else if (!/^[가-힣a-zA-Z0-9\s]+$/.test(trimmedKoName)) {
        error.koName = '한글, 영문, 숫자, 공백만 입력 가능합니다.';
      }
    }
    
    // 영어 이름 검증
    const trimmedEnName = enName.trim();
    if (trimmedEnName === '') {
      // 빈 값은 실시간 검증에서 에러로 표시하지 않음 (제출 시에만 검증)
    } else {
      if (trimmedEnName.length > MAX_KEYWORD_LENGTH) {
        error.enName = `영어 이름은 ${MAX_KEYWORD_LENGTH}자 이하여야 합니다.`;
      } else if (!/^[a-zA-Z0-9\s]+$/.test(trimmedEnName)) {
        error.enName = '영문, 숫자, 공백만 입력 가능합니다.';
      }
    }
    
    return error;
  };

  const handleAddKeyword = () => {
    if (keywordInputs.length >= MAX_KEYWORD_COUNT) {
      message.warning(`최대 ${MAX_KEYWORD_COUNT}개까지 추가할 수 있습니다.`);
      return;
    }
    setKeywordInputs([...keywordInputs, { koName: '', enName: '' }]);
  };

  const handleRemoveKeyword = (index: number) => {
    if (keywordInputs.length > 1) {
      setKeywordInputs(keywordInputs.filter((_, i) => i !== index));
    }
  };

  const handleKeywordChange = (index: number, field: 'koName' | 'enName', value: string) => {
    const newInputs = [...keywordInputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setKeywordInputs(newInputs);
    
    // 실시간 검증
    const newErrors = [...errors];
    const keyword = newInputs[index];
    newErrors[index] = validateKeyword(keyword.koName, keyword.enName);
    setErrors(newErrors);
  };

  const handleSubmit = () => {
    // 모든 입력값 검증
    const newErrors: KeywordError[] = [];
    let hasError = false;
    
    keywordInputs.forEach((keyword, index) => {
      const trimmedKoName = keyword.koName.trim();
      const trimmedEnName = keyword.enName.trim();
      const error: KeywordError = {};
      
      // 한글 이름 검증
      if (trimmedKoName === '') {
        error.koName = '한글 이름을 입력해주세요.';
        hasError = true;
      } else if (trimmedKoName.length > MAX_KEYWORD_LENGTH) {
        error.koName = `한글 이름은 ${MAX_KEYWORD_LENGTH}자 이하여야 합니다.`;
        hasError = true;
      } else if (!/^[가-힣a-zA-Z0-9\s]+$/.test(trimmedKoName)) {
        error.koName = '한글, 영문, 숫자, 공백만 입력 가능합니다.';
        hasError = true;
      }
      
      // 영어 이름 검증
      if (trimmedEnName === '') {
        error.enName = '영어 이름을 입력해주세요.';
        hasError = true;
      } else if (trimmedEnName.length > MAX_KEYWORD_LENGTH) {
        error.enName = `영어 이름은 ${MAX_KEYWORD_LENGTH}자 이하여야 합니다.`;
        hasError = true;
      } else if (!/^[a-zA-Z0-9\s]+$/.test(trimmedEnName)) {
        error.enName = '영문, 숫자, 공백만 입력 가능합니다.';
        hasError = true;
      }
      
      newErrors[index] = error;
    });
    
    setErrors(newErrors);
    
    if (hasError) {
      message.warning('입력값을 확인해주세요.');
      return;
    }
    
    // 빈 입력 제거 및 유효성 검사
    const validKeywords = keywordInputs.filter(
      (kw) => kw.koName.trim() !== '' && kw.enName.trim() !== ''
    );

    if (validKeywords.length === 0) {
      message.warning('최소 하나의 키워드를 입력해주세요.');
      return;
    }

    if (validKeywords.length > MAX_KEYWORD_COUNT) {
      message.warning(`최대 ${MAX_KEYWORD_COUNT}개까지 등록할 수 있습니다.`);
      return;
    }
    
    // 중복 키워드 검사
    const keywordSet = new Set<string>();
    const duplicates: string[] = [];
    
    validKeywords.forEach((kw) => {
      const key = `${kw.koName.trim()}_${kw.enName.trim()}`.toLowerCase();
      if (keywordSet.has(key)) {
        duplicates.push(`${kw.koName.trim()} (${kw.enName.trim()})`);
      } else {
        keywordSet.add(key);
      }
    });
    
    if (duplicates.length > 0) {
      message.warning(`중복된 키워드가 있습니다: ${duplicates.join(', ')}`);
      return;
    }

    recommendKeywords(validKeywords, {
      onSuccess: () => {
        message.success('추천 키워드가 성공적으로 등록되었습니다.');
        onClose();
      },
      onError: (error: unknown) => {
        console.error('추천 키워드 등록 실패', error);
        message.error('추천 키워드 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
      },
    });
  };

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
          추천 키워드 등록
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            새로운 키워드를 추천해주세요. 등록된 키워드는 관리자 검토 후 활성화됩니다.
          </Typography>
          
          {keywordInputs.map((keyword, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
              }}
            >
              <TextField
                label="한글 이름"
                value={keyword.koName}
                onChange={(e) => handleKeywordChange(index, 'koName', e.target.value)}
                fullWidth
                size="small"
                placeholder="예: 리액트"
                error={!!errors[index]?.koName}
                helperText={errors[index]?.koName}
                inputProps={{
                  maxLength: MAX_KEYWORD_LENGTH,
                }}
              />
              <TextField
                label="영어 이름"
                value={keyword.enName}
                onChange={(e) => handleKeywordChange(index, 'enName', e.target.value)}
                fullWidth
                size="small"
                placeholder="예: React"
                error={!!errors[index]?.enName}
                helperText={errors[index]?.enName}
                inputProps={{
                  maxLength: MAX_KEYWORD_LENGTH,
                }}
              />
              {keywordInputs.length > 1 && (
                <IconButton
                  onClick={() => handleRemoveKeyword(index)}
                  size="small"
                  sx={{ mt: 0.5 }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Typography variant="body2" color="text.secondary">
          한글과 영문 키워드를 입력해주세요
          </Typography>
          <Button
            variant="outlined"
            onClick={handleAddKeyword}
            disabled={keywordInputs.length >= MAX_KEYWORD_COUNT}
            sx={{ alignSelf: 'flex-start' }}
          >
            + 키워드 추가 {keywordInputs.length >= MAX_KEYWORD_COUNT && `(최대 ${MAX_KEYWORD_COUNT}개)`}
          </Button>

          {keywordInputs.some((kw) => kw.koName.trim() !== '' || kw.enName.trim() !== '') && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                입력된 키워드 미리보기:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {keywordInputs
                  .filter((kw) => kw.koName.trim() !== '' && kw.enName.trim() !== '')
                  .map((kw, idx) => (
                    <Chip
                      key={idx}
                      label={`${kw.koName} (${kw.enName})`}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isRecommending}>
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isRecommending}
        >
          {isRecommending ? <CircularProgress size={20} /> : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

