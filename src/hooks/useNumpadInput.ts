import { useCallback } from 'react';

interface UseNumpadInputProps {
  currentAnswer: string;
  onAnswerChange: (answer: string) => void;
}

export const useNumpadInput = ({ currentAnswer, onAnswerChange }: UseNumpadInputProps) => {

  const formatNumber = useCallback((num: string) => {
    return num.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const formattedValue = formatNumber(newValue);
    if (formattedValue.length <= 12) {
      onAnswerChange(formattedValue);
    }
  }, [formatNumber, onAnswerChange]);

  const handleDigit = useCallback((digit: string) => {
    if (currentAnswer.replace(/\./g, '').length < 12) {
      const newValue = currentAnswer.replace(/\./g, '') + digit;
      const formattedValue = formatNumber(newValue);
      onAnswerChange(formattedValue);
    }
  }, [currentAnswer, formatNumber, onAnswerChange]);

  const handleDelete = useCallback(() => {
    onAnswerChange(currentAnswer.slice(0, -1));
  }, [currentAnswer, onAnswerChange]);

  return {
    formatNumber,
    handleInputChange,
    handleDigit,
    handleDelete,
  };
};
