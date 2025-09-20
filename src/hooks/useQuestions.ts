
import { useState, useCallback } from 'react';
import { useQuestionsContext } from './QuestionsContext';

// Hook para manejar la selección y el estado de las preguntas jugadas.
export const useQuestions = () => {
  const { questions: allQuestions, isLoading } = useQuestionsContext();
  const [playedQuestions, setPlayedQuestions] = useState<string[]>([]);

  const selectNewQuestion = useCallback(() => {
    if (isLoading || allQuestions.length === 0) return null;

    const availableQuestions = allQuestions.filter(q => !playedQuestions.includes(q.pregunta));
    const questionPool = availableQuestions.length > 0 ? availableQuestions : allQuestions;

    if (questionPool.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * questionPool.length);
    const newQuestion = questionPool[randomIndex];

    setPlayedQuestions(prev => [...prev, newQuestion.pregunta]);
    return newQuestion;
  }, [allQuestions, playedQuestions, isLoading]);

  const resetPlayedQuestions = useCallback(() => {
    setPlayedQuestions([]);
  }, []);

  return {
    selectNewQuestion,
    resetPlayedQuestions,
    isLoadingQuestions: isLoading,
  };
};