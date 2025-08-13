import React from 'react';
import { Player } from '../types';

interface GameStatsProps {
  players: Player[];
  onReset: () => void;
  highScore: number;
}

const GameStats: React.FC<GameStatsProps> = ({ players, onReset, highScore }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isNewHighScore = winner.score === highScore && players.some(p => p.score > 0);

  return (
    <div className="text-center">
      <h4>Felicitaciones</h4>

      {isNewHighScore && (
        <div className="alert alert-success">
          <h4>¡Nuevo Puntaje Más Alto!</h4>
          <p className="display-4">{highScore}</p>
        </div>
      )}

      <h1 className="my-3 d-flex align-items-center justify-content-center"><img src={winner.avatar} alt={winner.name} className="player-avatar ms-2" /> {winner.name} </h1>
      
      <div className="card my-4">
        <div className="card-header">
          <h4>Estadísticas del juego</h4>
        </div>
        <div className="card-body">
          <table className="table table-striped">
    <thead>
        <tr>
            <th>Jugador</th>
            <th>Puntaje Final</th>
            <th>Exactas</th>
            <th>Correctas</th>
            <th>Incorrectas</th>
        </tr>
    </thead>
    <tbody>
        {sortedPlayers.map((player, index) => (
            <tr key={index}>
                <td style={{ textAlign: 'left' }}>
                    <img src={player.avatar} alt={player.name} className="player-avatar" style={{ width: '75px', height: '75px' }} /> 
                    {player.name}
                </td>
                <td style={{ textAlign: 'center' }}>{player.score}</td>
                <td style={{ textAlign: 'center' }}>{player.exactHits}</td>
                <td style={{ textAlign: 'center' }}>{player.correctHits}</td>
                <td style={{ textAlign: 'center' }}>{player.wrongHits}</td>
            </tr>
        ))}
    </tbody>
</table>
        </div>
      </div>

      <button className="btn btn-primary btn-lg" onClick={onReset}>
        Jugar de Nuevo
      </button>
    </div>
  );
};

export default GameStats;