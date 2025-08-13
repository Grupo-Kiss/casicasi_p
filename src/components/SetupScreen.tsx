import React, { useState, useEffect } from 'react';
import { Player, Question } from '../types';

interface SetupScreenProps {
  onGameStart: (players: Player[], rounds: number, category: string) => void;
  highScore: number;
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
    <div className="setup-container text-center">
      <div className="mb-0">
        <h3>Puntaje Más Alto: {highScore}</h3>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-4">
          <h4>Jugadores</h4>
          {players.map((player, index) => (
            <div className="player-card" key={index}>
              <input
                type="text"
                className="form-control"
                placeholder={`Nombre del Jugador ${index + 1}`}
                value={player.name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
              />
              {players.length > 1 && (
                <button className="btn btn-danger ms-2" onClick={() => removePlayer(index)}>
                  &times;
                </button>
              )}
            </div>
          ))}
          {players.length < 4 && (
            <button className="btn btn-primary mt-3" onClick={addPlayer}>
              Agregar Jugador
            </button>
          )}
        </div>
      </div>

      <div className="row justify-content-center mt-1">
        <div className="col-lg-8">
          <h4>Opciones de Juego</h4>
          <div className="card" style={{ backgroundColor: '#e9f1f9ff' }}>
            <div className="card-body">
              <div className="mb-4">
                <h5>Elegí cuantas preguntas tendrá el juego...</h5>
                <div className="btn-group w-100 option-group" role="group">
                  {[5, 10, 15].map(num => (
                    <button 
                      key={num} 
                      type="button" 
                      className={`btn ${rounds === num ? 'active' : ''}`}
                      onClick={() => setRounds(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h5>Elegí un tema o jugá con todas las categorías...</h5>
                <select 
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }}
                >
                  <option value="all">Todas las Categorías</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <button 
          className={`btn btn-success btn-lg ${canStart ? 'start-button-glow' : ''}`}
          onClick={() => onGameStart(players, rounds, selectedCategory)}
          disabled={!canStart}
        >
          Iniciar
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;