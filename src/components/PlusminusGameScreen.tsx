import React, { useRef, useEffect } from 'react';
import { Question, Player } from '../types';
import Numpad from './Numpad';
import TimerBar from './TimerBar'; // Import TimerBar

import '../styles/GameScreen.css';

interface PlusminusGameScreenProps {
  question: Question;
  player: Player;
  guessesLeft: number;
  hint: '+' | '-' | null;
  currentAnswer: string;
  onAnswerChange: (answer: string) => void;
  onGuessSubmit: () => void;
  plusminusTimer: number;
  initialGuesses: number;
}

const PlusminusGameScreen: React.FC<PlusminusGameScreenProps> = ({
  question,
  player,
  guessesLeft,
  hint,
  currentAnswer,
  onAnswerChange,
  onGuessSubmit,
  plusminusTimer,
  initialGuesses
}) => {

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [question]);

  

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
      onGuessSubmit();
    }
  };

  const guessIndicators = Array.from({ length: initialGuesses }, (_, i) => (
    <div
      key={i}
      className={`guess-indicator ${i < guessesLeft ? 'filled' : 'empty'}`}
    ></div>
  ));

  return (
    <div className="game-screen plusminus-screen">
      <div className="game-header">
      </div>
      
      <div className="game-main-content"> {/* Added game-main-content */}
        <div className="game-info-col"> {/* Added game-info-col */}
          <div className="player-turn-info"> {/* Moved player info here */}
            <img src={player.avatar} alt={player.name} className="player-avatar" />
            <div className="name"> {player.name}</div>
          </div>
          <div className="question-section">
            
            <p className="question-text-highlight">{question.pregunta}</p>
          </div>
          <div className="guesses-visual-container"> 
            {guessIndicators}
          </div>
          <div className="plusminus-info">
            {hint && <div className="hint"> {hint}</div>}
            
          </div>
        </div> {/* End game-info-col */}

        <div className="game-numpad-col"> {/* Added game-numpad-col */}
          <div className="input-section">
            <input
              ref={inputRef}
              type="text"
              className="player-input"
              placeholder="Tu intento"
              value={currentAnswer}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus={false}
            />
            <Numpad onDigit={handleDigit} onDelete={handleDelete} onSubmit={onGuessSubmit} />
            <TimerBar timer={plusminusTimer} maxTime={10} />
          </div>
        </div> {/* End game-numpad-col */}
      </div> {/* End game-main-content */}
    </div>
  );
};

export default PlusminusGameScreen;