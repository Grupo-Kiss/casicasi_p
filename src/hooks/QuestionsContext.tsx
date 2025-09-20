
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Question } from '../types';

interface QuestionsContextType {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  isLoading: boolean;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export const QuestionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const questionsUrl = process.env.REACT_APP_QUESTIONS_URL || `${process.env.PUBLIC_URL}/questions.json`;
    setIsLoading(true);
    fetch(questionsUrl)
      .then(response => response.json())
      .then((data: Question[]) => {
        const activeQuestions = data.filter(q => q.activa === 'SI');
        setQuestions(activeQuestions);
      })
      .catch(error => {
        console.error('Error loading initial questions from', questionsUrl, error);
        // Handle error, maybe set a default empty question set
        setQuestions([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSetQuestions = useCallback((newQuestions: Question[]) => {
    const activeQuestions = newQuestions.filter(q => q.activa === 'SI');
    setQuestions(activeQuestions);
  }, []);

  return (
    <QuestionsContext.Provider value={{ questions, setQuestions: handleSetQuestions, isLoading }}>
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestionsContext = () => {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error('useQuestionsContext must be used within a QuestionsProvider');
  }
  return context;
};
