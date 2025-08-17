import { useRef, useCallback, useEffect } from 'react';

// Hook para aplicar un debounce a una función.
// Esto previene que una función se ejecute múltiples veces en un corto periodo de tiempo.
export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Actualiza la referencia al callback si cambia
  callbackRef.current = callback;

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Limpia el temporizador cuando el componente se desmonta
  // o cuando el delay cambia
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]); // Dependencia en delay para re-ejecutar cleanup si el delay cambia

  return debouncedCallback;
}