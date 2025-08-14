import React from 'react';
import { Question, Player } from '../types';

import Numpad from './Numpad';
import '../styles/GameScreen.css';

interface GameScreenProps {
  question: Question;
  players: Player[];
  currentPlayerIndex: number;
  currentAnswer: string;
  onAnswerChange: (answer: string) => void;
  onAnswerSubmit: () => void;
  timer: number;
  round: number;
  numberOfRounds: number;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  question, 
  players, 
  currentPlayerIndex, 
  currentAnswer, 
  onAnswerChange, 
  onAnswerSubmit,
  timer,
  round,
  numberOfRounds
}) => {

  const formatNumber = (num: string) => {
    return num.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const formattedValue = formatNumber(newValue);
    if (formattedValue.length <= 12) {
      onAnswerChange(formattedValue);
    }
  };

  const handleDigit = (digit: string) => {
    if (currentAnswer.replace(/\./g, '').length < 12) {
      const newValue = currentAnswer.replace(/\./g, '') + digit;
      const formattedValue = formatNumber(newValue);
      onAnswerChange(formattedValue);
    }
  };

  const handleDelete = () => {
    onAnswerChange(currentAnswer.slice(0, -1));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onAnswerSubmit();
    }
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className="round-info">Ronda {round + 1} de {numberOfRounds}</div>
        
      </div>
      <div className="question-section">
        <div className="category">{question.categoria}</div>
        <p className="question-text">{question.pregunta}</p>
      </div>
      <div className="input-section">
        <input
          type="text"
          className="player-input"
          placeholder="Tu respuesta"
          value={currentAnswer}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Numpad onDigit={handleDigit} onDelete={handleDelete} onSubmit={onAnswerSubmit} timer={timer} />
      </div>
      <div className="scoreboard-section">
        {players.map((player, index) => (
          <div key={index} className={`player-stat ${index === currentPlayerIndex ? 'active' : ''}`}>
            <img src={player.avatar} alt={player.name} className="avatar" />
            <div className="name">{player.name}</div>
            <div className="score">{player.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameScreen;