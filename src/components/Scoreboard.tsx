import React from 'react';
import { Player } from '../types';

interface ScoreboardProps {
  players: Player[];
  currentPlayerIndex: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, currentPlayerIndex }) => {
  return (
    <div className="d-flex flex-wrap justify-content-center">
      {players.map((player, index) => (
        <div 
          className={`d-flex flex-column align-items-center p-3 rounded m-2 ${index === currentPlayerIndex ? 'bg-white text-primary' : 'bg-light'}`} 
          key={index}
          style={{ width: '235px' }} // Ajusta el ancho según sea necesario
        >
          <img src={player.avatar} alt={player.name} className="player-avatar" style={{ width: '75px', height: '75px'}} />
          <div className={`fw-bold`}>{player.name}</div>
          <div className="fs-5">{player.score}</div>
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;
