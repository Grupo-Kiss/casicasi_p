import React from 'react';
import { Player } from '../types';
import '../styles/TurnSwitcher.css';
import { useEnterToContinue } from '../hooks/useEnterToContinue'; // Importar useEnterToContinue

interface TurnSwitcherProps {
  player: Player;
  onTurnSwitchComplete: () => void;
}

const TurnSwitcher: React.FC<TurnSwitcherProps> = ({ player, onTurnSwitchComplete }) => {

  const handleStartClick = () => {
    onTurnSwitchComplete();
  };

  // Usar el hook para manejar Enter para empezar el turno
  useEnterToContinue(onTurnSwitchComplete);

  return (
    <div className="turn-switcher-modal">
      <img src={player.avatar} alt={player.name} className="player-avatar" />
      <h2>Siguiente Turno</h2>
      <div className="player-name">{player.name}</div>
      <button 
        className="start-turn-btn"
        onClick={handleStartClick}
      >
        <span>Empezar Turno</span>
      </button>
    </div>
  );
};

export default TurnSwitcher;