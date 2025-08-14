
import React from 'react';
import { Question, Player } from '../types';
import '../styles/AnswerResult.css';

interface AnswerResultProps {
  question: Question;
  userAnswer: string;
  scoreAwarded: number;
  player: Player;
}

const AnswerResult: React.FC<AnswerResultProps> = ({ question, userAnswer, scoreAwarded, player }) => {
  const scoreClass = scoreAwarded >= 0 ? 'positive' : 'negative';

  return (
    <div className="answer-result-modal">
      <div className="answer-result-card">
        <img src={player.avatar} alt={player.name} className="avatar" />
        <h2>{player.name}</h2>
        <p className={`score-awarded ${scoreClass}`}>{scoreAwarded > 0 ? `+${scoreAwarded}` : scoreAwarded}</p>
        <div className="correct-answer-info">
          <p>Tu respuesta: <strong>{userAnswer || 'No respondido'}</strong></p>
          <p>Respuesta correcta: <strong>{question.respuesta}</strong></p>
        </div>
        <p><em>{question.informacion}</em></p>
        <p><small>Fuente: {question.fuente}</small></p>
      </div>
    </div>
  );
};

export default AnswerResult;
