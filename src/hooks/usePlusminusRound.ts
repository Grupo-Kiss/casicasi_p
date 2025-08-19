import { useState, useCallback, useRef } from 'react';
import { Question, Player } from '../types';
import { useQuestions } from './useQuestions';
import { useCountdown } from './useCountdown';

export const usePlusminusRound = (
  onRoundEnd: (points: number, resultType: keyof Player, timeUsed: number, timeBonus: number) => void,
  onPlusminusLose: () => void,
  gameScreen: 'setup' | 'playing' | 'showing_answer' | 'turn_switching' | 'gameover' | 'plusminus_round',
) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [wildcardPlayed, setWildcardPlayed] = useState(false);

  const [plusminusGuessesLeft, setPlusminusGuessesLeft] = useState(0);
  const [plusminusHint, setPlusminusHint] = useState<'+' | '-' | null>(null);
  const [initialGuesses, setInitialGuesses] = useState(0);

  const { selectNewQuestion } = useQuestions();
  const onRoundEndRef = useRef(onRoundEnd);
  onRoundEndRef.current = onRoundEnd;
  const onPlusminusLoseRef = useRef(onPlusminusLose);
  onPlusminusLoseRef.current = onPlusminusLose;

  const {
    timer: plusminusTimer,
    start: startPlusminusTimer,
    reset: resetPlusminusTimer
  } = useCountdown(10, () => {
    if (plusminusGuessesLeft - 1 <= 0) {
      onPlusminusLoseRef.current();
    } else {
      setPlusminusGuessesLeft(prev => prev - 1);
      setPlusminusHint(null);
      setCurrentAnswer('');
      startPlusminusTimer();
    }
  });

  const handlePlusminusGuess = useCallback(() => {
    if (!currentQuestion) return;

    const guessNum = Math.round(parseFloat(currentAnswer.replace(/\./g, '')));
    
    const timeUsed = 10 - plusminusTimer;

    if (isNaN(guessNum)) {
      setPlusminusHint(null);
      setCurrentAnswer('');
      resetPlusminusTimer();
      setPlusminusGuessesLeft(prev => prev - 1);
      if (plusminusGuessesLeft - 1 <= 0) {
        onPlusminusLoseRef.current();
      } else {
        startPlusminusTimer();
      }
      return;
    }

    const correctAnswer = currentQuestion.respuesta;

    if (guessNum === correctAnswer) {
      const bonus = plusminusGuessesLeft * 25;
      const scoreChange = 75 + bonus;
      onRoundEndRef.current(scoreChange, 'exactHits', timeUsed, bonus);
      resetPlusminusTimer();
    } else {
      setPlusminusHint(guessNum < correctAnswer ? '+' : '-');
      setPlusminusGuessesLeft(prev => prev - 1);
      setCurrentAnswer('');
      resetPlusminusTimer();
      if (plusminusGuessesLeft - 1 <= 0) {
        onPlusminusLoseRef.current();
      } else {
        startPlusminusTimer();
      }
    }
  }, [currentAnswer, currentQuestion, plusminusGuessesLeft, plusminusTimer, onRoundEndRef, onPlusminusLoseRef, startPlusminusTimer, resetPlusminusTimer]);

  const startPlusminusRound = useCallback(() => {
    const newQuestion = selectNewQuestion();
    if (!newQuestion) return;

    setCurrentQuestion(newQuestion);
    const initial = Math.floor(Math.random() * 16) + 5;
    setPlusminusGuessesLeft(initial);
    setInitialGuesses(initial);
    setPlusminusHint(null);
    setCurrentAnswer('');
    setWildcardPlayed(true);
    startPlusminusTimer();
  }, [selectNewQuestion, startPlusminusTimer]);

  const nextQuestion = useCallback(() => {
    const newQuestion = selectNewQuestion();
    if (!newQuestion) return;

    setCurrentQuestion(newQuestion);
    setCurrentAnswer('');
    resetPlusminusTimer();
    setPlusminusHint(null);
    startPlusminusRound();
  }, [selectNewQuestion, resetPlusminusTimer, startPlusminusRound]);

  return {
    currentQuestion,
    currentAnswer,
    setCurrentAnswer,
    plusminusTimer,
    wildcardPlayed,
    setWildcardPlayed,
    plusminusGuessesLeft,
    plusminusHint,
    handlePlusminusGuess,
    startPlusminusRound,
    nextQuestion,
    initialGuesses,
  };
};

