import { useState, useCallback, useRef } from 'react';
import { Question, Player } from '../types';
import { useQuestions } from './useQuestions';
import { useCountdown } from './useCountdown';

export const useClassicRound = (
  onRoundEnd: (points: number, resultType: keyof Player, timeUsed: number, timeBonus: number) => void,
  gameScreen: 'setup' | 'playing' | 'showing_answer' | 'turn_switching' | 'gameover' | 'plusminus_round',
) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [wildcardPlayed, setWildcardPlayed] = useState(false);

  const { selectNewQuestion } = useQuestions();
  const onRoundEndRef = useRef(onRoundEnd);
  onRoundEndRef.current = onRoundEnd;

  const handleClassicTimeout = useCallback(() => {
    onRoundEndRef.current(-20, 'wrongHits', 30, 0);
  }, []);

  const {
    timer: classicTimer,
    start: startClassicTimer,
    reset: resetClassicTimer
  } = useCountdown(30, handleClassicTimeout);

  const handleClassicAnswer = useCallback(() => {
    if (!currentQuestion) return;

    let points = 0;
    let timeBonus = 0;
    let resultType: keyof Player = 'wrongHits';
    const timeUsed = 30 - classicTimer;

    const answerNum = Math.round(parseFloat(currentAnswer.replace(/\./g, '')));
    if (isNaN(answerNum)) {
      points = -25;
    } else {
      const { respuesta, rango_min, rango_max } = currentQuestion;
      const diff = Math.abs(answerNum - respuesta);

      if (answerNum === respuesta) {
        points = 150;
        timeBonus = classicTimer;
        resultType = 'exactHits';
      } else if (answerNum >= rango_min && answerNum <= rango_max) {
        points = 50;
        timeBonus = classicTimer;
        resultType = 'correctHits';
      } else if (diff <= respuesta * 0.20) {
        points = 15;
        timeBonus = classicTimer;
      } else if (diff <= respuesta * 0.30) {
        points = 10;
        timeBonus = classicTimer;
      } else if (diff <= respuesta * 0.40) {
        points = 5;
        timeBonus = classicTimer;
      } else {
        points = 0;
      }
    }
    const totalPoints = points + timeBonus;
    onRoundEndRef.current(totalPoints, resultType, timeUsed, timeBonus);
  }, [currentAnswer, currentQuestion, classicTimer]);

  const nextQuestion = useCallback(() => {
    const newQuestion = selectNewQuestion();
    if (!newQuestion) return;

    setCurrentQuestion(newQuestion);
    setCurrentAnswer('');
    resetClassicTimer();
    startClassicTimer();
  }, [selectNewQuestion, startClassicTimer, resetClassicTimer]);

  return {
    currentQuestion,
    currentAnswer,
    setCurrentAnswer,
    classicTimer,
    wildcardPlayed,
    setWildcardPlayed,
    handleClassicAnswer,
    nextQuestion,
  };
};