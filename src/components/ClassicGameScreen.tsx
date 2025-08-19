import React, { useRef, useEffect } from 'react';
import { Question, Player } from '../types';

import Numpad from './Numpad';
import TimerBar from './TimerBar'; // Import TimerBar

import { useNumpadInput } from '../hooks/useNumpadInput';
import '../styles/GameScreen.css';

interface ClassicGameScreenProps {
  question: Question;
  players: Player[];
  currentPlayerIndex: number;
  currentAnswer: string;
  onAnswerChange: (answer: string) => void;
  onAnswerSubmit: () => void;
  classicTimer: number;
  round: number;
  numberOfRounds: number;
}

const ClassicGameScreen: React.FC<ClassicGameScreenProps> = ({
  question,
  players,
  currentPlayerIndex,
  currentAnswer,
  onAnswerChange,
  onAnswerSubmit,
  classicTimer,
  round,
  numberOfRounds
}) => {

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [question]);

  

  const { handleInputChange, handleDigit, handleDelete } = useNumpadInput({ currentAnswer, onAnswerChange });

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onAnswerSubmit();
    }
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="game-screen">
      <div className="game-header">
      </div>
      
      <div className="game-main-content">
        <div className="game-info-col">
          <div className="player-turn-info">
            <img src={currentPlayer.avatar} alt={currentPlayer.name} className="player-avatar" />
            <div className="name">{currentPlayer.name}</div>
          </div>
          <h3 className="category-tag">{question.categoria}</h3>
          <h1 className="question-text-highlight">{question.pregunta}</h1>
        </div>

        <div className="game-numpad-col">
          <div className="input-section">
            <input
              ref={inputRef}
              type="text"
              className="player-input"
              placeholder=""
              value={currentAnswer}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus={false}
            />
            <Numpad onDigit={handleDigit} onDelete={handleDelete} onSubmit={onAnswerSubmit} />
            <TimerBar timer={classicTimer} maxTime={30} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicGameScreen;