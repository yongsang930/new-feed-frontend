import { useContext } from 'react';
import { MessageContext } from '../contexts/MessageContext';

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within MessageContextProvider');
  }
  return context;
};

