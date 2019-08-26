import { useRef } from 'react';

export const useRendered = () => {
  const r = useRef(0);
  r.current++;
  return r.current;
};
