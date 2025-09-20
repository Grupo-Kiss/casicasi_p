import React from 'react';
import { Player } from '../types';
import '../styles/Scoreboard.css'; // Importar estilos

interface ScoreboardProps {
  players: Player[];
  currentPlayerIndex: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, currentPlayerIndex }) => {
  return (
    <div className="scoreboard-container">
      {players.map((player, index) => (
        <div
          className={`player-score-card ${index === currentPlayerIndex ? 'active' : 'inactive'}`}
          key={index}
        >
          <img src={player.avatar} alt={player.name} className="player-avatar" />
          <div className="player-name">{player.name}</div>
          <div className="player-score">{player.score}</div>
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;
