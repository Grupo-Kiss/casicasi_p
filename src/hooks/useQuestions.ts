import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types';

export const useQuestions = () => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [playedQuestions, setPlayedQuestions] = useState<string[]>([]);

  useEffect(() => {
    fetch('/questions.json')
      .then(response => response.json())
      .then((data: Question[]) => {
        const activeQuestions = data.filter(q => q.activa === 'SI');
        setAllQuestions(activeQuestions);
      })
      .catch(error => console.error('Error loading questions:', error));
  }, []);

  const selectNewQuestion = useCallback(() => {
    if (allQuestions.length === 0) return null;

    const availableQuestions = allQuestions.filter(q => !playedQuestions.includes(q.pregunta));
    const questionPool = availableQuestions.length > 0 ? availableQuestions : allQuestions;
    
    if (questionPool.length === 0) return null; // No questions left to select

    const randomIndex = Math.floor(Math.random() * questionPool.length);
    const newQuestion = questionPool[randomIndex];
    
    setPlayedQuestions(prev => [...prev, newQuestion.pregunta]);
    return newQuestion;
  }, [allQuestions, playedQuestions]);

  const resetPlayedQuestions = useCallback(() => {
    setPlayedQuestions([]);
  }, []);

  return {
    selectNewQuestion,
    resetPlayedQuestions,
  };
};