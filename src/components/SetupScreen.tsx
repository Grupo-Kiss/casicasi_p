import React, { useState, useEffect } from 'react';
import { Player, Question } from '../types';
import '../styles/SetupScreen.css';

interface SetupScreenProps {
  onGameStart: (players: Player[], rounds: number, category: string) => void;
  highScore: { score: number; name: string } | null;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onGameStart, highScore }) => {
  const [players, setPlayers] = useState<Player[]>([
    { name: '', avatar: '', score: 0, exactHits: 0, correctHits: 0, wrongHits: 0 },
  ]);
  const [rounds, setRounds] = useState(5);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then((questions: Question[]) => {
        const uniqueCategories = Array.from(new Set(questions.map(q => q.categoria)));
        setCategories(uniqueCategories);
      });
  }, []);

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, { name: '', avatar: '', score: 0, exactHits: 0, correctHits: 0, wrongHits: 0 }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const canStart = players.every(p => p.name.trim() !== '');

  return (
    <div className="setup-screen">
      <h1>Configuración del Juego</h1>
      <div className="player-inputs">
        <h2>Jugadores</h2>
        {players.map((player, index) => (
          <div className="player-input-group" key={index}>
            <input
              type="text"
              placeholder={`Jugador ${index + 1}`}
              value={player.name}
              onChange={(e) => handlePlayerNameChange(index, e.target.value)}
            />
            {players.length > 1 && (
              <button className="remove-player-btn" onClick={() => removePlayer(index)}>&times;</button>
            )}
          </div>
        ))}
        {players.length < 4 && (
          <button className="add-player-btn" onClick={addPlayer}>+ Agregar Jugador</button>
        )}
      </div>
      <div className="options-group">
        <h2>Rondas</h2>
        <div className="segmented-control">
          {[5, 10, 15].map(num => (
            <button 
              key={num} 
              className={rounds === num ? 'active' : ''}
              onClick={() => setRounds(num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
      <div className="options-group">
        <h2>Categoría</h2>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="all">Todas</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {highScore && <p>Highscore: {highScore.score} por {highScore.name}</p>}
      <button 
        className="start-game-btn"
        onClick={() => onGameStart(players, rounds, selectedCategory)}
        disabled={!canStart}
      >
        Empezar a Jugar
      </button>
    </div>
  );
};

export default SetupScreen;
