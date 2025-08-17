import { useState, useEffect, useRef, useCallback } from 'react';

export const useCountdown = (initialValue: number, onTimeout: () => void) => {
  const [timer, setTimer] = useState(initialValue);
  const [isActive, setIsActive] = useState(false);
  const onTimeoutRef = useRef(onTimeout); // Para capturar la última callback

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (isActive && timer === 0) {
      setIsActive(false); // Detener el temporizador
      onTimeoutRef.current(); // Llamar al handler de timeout
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);

  const start = useCallback(() => {
    setTimer(initialValue);
    setIsActive(true);
  }, [initialValue]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setTimer(initialValue);
  }, [initialValue]);

  return { timer, start, pause, reset, isActive };
};