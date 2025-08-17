import React, { useEffect } from 'react';
import { Player } from '../types';
import '../styles/GameStats.css';
import { useEnterToContinue } from '../hooks/useEnterToContinue'; // Importar useEnterToContinue

interface GameStatsProps {
  players: Player[];
  onReset: () => void;
  highScore: { score: number; name: string } | null;
}

const GameStats: React.FC<GameStatsProps> = ({ players, onReset, highScore }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isNewHighScore = highScore && winner.score === highScore.score && players.some(p => p.score > 0);

  // Usar el hook para manejar Enter para reiniciar el juego
  useEnterToContinue(onReset);

  return (
    <div className="game-stats-screen">
      <h1>¡Juego Terminado!</h1>
      {isNewHighScore && (
        <div className="new-highscore">
          <h2>¡Nuevo Record!</h2>
          <p>{highScore.score} puntos por {highScore.name}</p>
        </div>
      )}
      <div className="stats-main-content">
        <div className="winner-col">
          <div className="winner-section">
            <img src={winner.avatar} alt={winner.name} className="player-avatar" />
            <h2>{winner.name} es el ganador!</h2>
          </div>
        </div>
        <div className="table-col">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Puntaje</th>
                <th>Exactas</th>
                <th>Correctas</th>
                <th>Tiempo Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr key={index}>
                  <td>{player.name}</td>
                  <td>{player.score}</td>
                  <td>{player.exactHits}</td>
                  <td>{player.correctHits}</td>
                  <td>{player.totalTimeUsed}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button className="play-again-btn" onClick={onReset}>
        Jugar de Nuevo
      </button>
    </div>
  );
};

export default GameStats;
