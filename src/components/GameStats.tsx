import React from 'react';
import { Player } from '../types';
import '../styles/GameStats.css';

interface GameStatsProps {
  players: Player[];
  onReset: () => void;
  highScore: { score: number; name: string } | null;
}

const GameStats: React.FC<GameStatsProps> = ({ players, onReset, highScore }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isNewHighScore = highScore && winner.score === highScore.score && players.some(p => p.score > 0);

  return (
    <div className="game-stats-screen">
      <h1>¡Juego Terminado!</h1>
      {isNewHighScore && (
        <div className="new-highscore">
          <h2>¡Nuevo Record!</h2>
          <p>{highScore.score} puntos por {highScore.name}</p>
        </div>
      )}
      <div className="winner-section">
        <img src={winner.avatar} alt={winner.name} className="avatar" />
        <h2>{winner.name} es el ganador!</h2>
      </div>
      <table className="stats-table">
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Puntaje</th>
            <th>Exactas</th>
            <th>Correctas</th>
            <th>Incorrectas</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr key={index}>
              <td>{player.name}</td>
              <td>{player.score}</td>
              <td>{player.exactHits}</td>
              <td>{player.correctHits}</td>
              <td>{player.wrongHits}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="play-again-btn" onClick={onReset}>
        Jugar de Nuevo
      </button>
    </div>
  );
};

export default GameStats;
