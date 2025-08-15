import React from 'react';
import { Question, Player } from '../types';
import Numpad from './Numpad';
import '../styles/GameScreen.css'; // Reutilizamos algunos estilos

interface PlusminusScreenProps {
  question: Question;
  player: Player;
  guessesLeft: number;
  hint: '+' | '-' | null;
  currentAnswer: string;
  onAnswerChange: (answer: string) => void;
  onGuessSubmit: () => void;
  timer: number;
}

const PlusminusScreen: React.FC<PlusminusScreenProps> = ({ 
  question, 
  player, 
  guessesLeft, 
  hint,
  currentAnswer,
  onAnswerChange,
  onGuessSubmit, 
  timer
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
      onGuessSubmit();
    }
  };

  return (
    <div className="game-screen plusminus-screen">
      <div className="game-header">
        <div className="round-info">RONDA COMODÍN</div>
      </div>
      <div className="question-section">
        <div className="category">¡Más o Menos!</div>
        <p className="question-text">{question.pregunta}</p>
      </div>
      <div className="plusminus-info">
        <div className="guesses-left">Intentos: {guessesLeft}</div>
        {hint && <div className="hint">Pista: {hint}</div>}
      </div>
      <div className="input-section">
        <input
          type="text"
          className="player-input"
          placeholder="Tu intento"
          value={currentAnswer}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Numpad onDigit={handleDigit} onDelete={handleDelete} onSubmit={onGuessSubmit} timer={timer} />
      </div>
      <div className="scoreboard-section">
          <div className='player-stat active'>
            <img src={player.avatar} alt={player.name} className="avatar" />
            <div className="name">{player.name}</div>
            <div className="score">{player.score}</div>
          </div>
      </div>
    </div>
  );
};

export default PlusminusScreen;
