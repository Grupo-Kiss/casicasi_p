import React, { useState, useEffect } from 'react';
import { Question, Player } from '../types';
import Confetti from 'react-confetti';
import { useEnterToContinue } from '../hooks/useEnterToContinue';
import '../styles/AnswerResult.css';

interface AnswerResultProps {
  question: Question;
  userAnswer: string;
  scoreAwarded: number;
  player: Player;
  resultType: keyof Player | null;
  timeUsed: number | null;
  timeBonus: number | null;
  onContinue: () => void;
}

const AnswerResult: React.FC<AnswerResultProps> = ({ question, userAnswer, scoreAwarded, player, resultType, timeUsed, timeBonus, onContinue }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const scoreClass = scoreAwarded >= 0 ? 'positive' : 'negative';

  useEffect(() => {
    if (resultType === 'exactHits') {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [resultType]);

  const handleContinue = () => {
    if (isContinuing) return;
    setIsContinuing(true);
    // A small delay to allow for any visual feedback before advancing
    setTimeout(() => {
      onContinue();
    }, 100);
  };

  useEnterToContinue(handleContinue);

  return (
    <div className="answer-result-modal">
      {showConfetti && <Confetti
        style={{ pointerEvents: 'none' }}
        numberOfPieces={200}
        recycle={false}
        gravity={0.1}
        initialVelocityY={-5}
        confettiSource={{
          x: 0,
          y: 0,
          w: window.innerWidth,
          h: window.innerHeight,
        }}
        colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B']}
      />}
      <div className="answer-result-card">
        <div className="result-main-content">
          <div className="result-player-col">
            <img src={player.avatar} alt={player.name} className="player-avatar" />
            <h2>{player.name}</h2>
            <p className={`score-awarded ${scoreClass}`}>{scoreAwarded > 0 ? `+${scoreAwarded}` : scoreAwarded}</p>
            <button className="continue-btn" onClick={handleContinue} disabled={isContinuing}>Continuar</button>
          </div>

          <div className="result-info-col">
            {resultType === 'exactHits' && <h3 className="result-message exact">¡EXACTA!</h3>}
            {resultType === 'correctHits' && <h3 className="result-message correct">¡CORRECTA!</h3>}
            {resultType === 'wrongHits' && <h3 className="result-message wrong">INCORRECTA</h3>}

            <div className="correct-answer-info">
              <p>Tu respuesta: <strong>{userAnswer || 'No respondido'}</strong></p>
              <p>Respuesta correcta: <strong>{question.respuesta}</strong></p>
              {timeUsed !== null && timeUsed !== undefined && (
                <p>Tiempo utilizado: <strong>{timeUsed} segundos</strong></p>
              )}
              {timeBonus !== null && timeBonus !== undefined && timeBonus > 0 && (
                <p>Bonus: <strong>+{timeBonus} puntos</strong></p>
              )}
            </div>

            <div className="question-details-info">
              <p><em>{question.informacion}</em></p>
              <p><small>Fuente: {question.fuente}</small></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerResult;