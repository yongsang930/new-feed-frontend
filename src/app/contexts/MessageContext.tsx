import React, { createContext, useRef } from 'react';
import type { ReactNode } from 'react';
import { message } from 'antd';
import './MessageContext.scss';

interface MessageContextInterface {
  info: (message: string) => void;
  success: (message: string) => void;
  loading: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  lazyError: (message: string) => void;
  logoutError: (message: string, cb: () => void) => void;
}

export const MessageContext = createContext<MessageContextInterface | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function MessageContextProvider({ children }: Props) {
  const logoutMessageRef = useRef<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage({
    prefixCls: 'ant-message-custom',
  });
  const messageUseRef = useRef<boolean>(true);

  const info = (msg: string) => {
    messageApi.info(msg);
  };

  const success = (msg: string) => {
    messageApi.success(msg);
  };

  const loading = (msg: string) => {
    messageApi.loading(msg);
  };

  const error = (msg: string) => {
    messageApi.error(msg);
  };

  const warning = (msg: string) => {
    messageApi.warning(msg);
  };

  const lazyError = (msg: string) => {
    if (messageUseRef.current) {
      messageUseRef.current = false;
      messageApi.error(msg, 2, () => {
        messageUseRef.current = true;
      });
    }
  };

  const logoutError = (msg: string, cb: () => void) => {
    if (logoutMessageRef.current) return;

    logoutMessageRef.current = true;

    const onClose = () => {
      logoutMessageRef.current = false;
      messageApi.destroy();
      cb();
    };

    const AndAlert = () => {
      return (
        <>
          {/* <div className="alert-dim"></div> */}
          <div style={{ padding: '20px' }}>
            <div style={{ fontWeight: '500', marginBottom: '10px' }}>{msg}</div>
            <div style={{ marginBottom: '15px' }}>확인 버튼을 누르면 로그아웃됩니다.</div>
            <button
              style={{
                marginTop: '15px',
                padding: '4px 15px',
                backgroundColor: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={onClose}
            >
              확인
            </button>
          </div>
        </>
      );
    };

    messageApi.open({
      icon: undefined,
      className: 'full-alert',
      key: 'logout',
      content: AndAlert(),
      duration: 30,
      onClose: onClose,
      type: 'error',
      onClick: () => {},
    });
  };

  // 전역 접근을 위한 window 객체에 등록
  React.useEffect(() => {
    (window as any).__messageApi = { info, success, loading, error, warning, lazyError, logoutError };
    return () => {
      delete (window as any).__messageApi;
    };
  }, [info, success, loading, error, warning, lazyError, logoutError]);

  return (
    <MessageContext.Provider
      value={{ info, success, loading, error, warning, lazyError, logoutError }}
    >
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
}

