import React, { useState } from 'react';
import { Player } from '../types';
import '../styles/SetupScreen.css';
import Modal from './Modal';

interface SetupScreenProps {
  onGameStart: (players: Player[], rounds: number, gameMode: 'classic' | 'plusminus') => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onGameStart }) => {
  const [players, setPlayers] = useState<Player[]>([
    { name: '', avatar: '', score: 100, exactHits: 0, correctHits: 0, wrongHits: 0, totalTimeUsed: 0 },
  ]);
  const [rounds, setRounds] = useState(5);
  const [gameMode, setGameMode] = useState<'classic' | 'plusminus'>('classic');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, { name: '', avatar: '', score: 100, exactHits: 0, correctHits: 0, wrongHits: 0, totalTimeUsed: 0 }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const canStart = players.every(p => p.name.trim() !== '');

  const classicInstructions = (
    <div>
      <h2>Modo Clásico</h2>
      <ul>
        <li>Juega la cantidad de rondas seleccionada.</li>
        <li>Suma puntos por acertar o acercarte a la respuesta.</li>
        <li>¡La última ronda es un comodín 'Más o Menos' con un gran premio de <strong>+250 puntos</strong>!</li>
      </ul>
    </div>
  );

  const plusminusInstructions = (
    <div>
      <h2>Modo Más o Menos</h2>
      <ul>
        <li>Todas las rondas son en este modo.</li>
        <li>Adivina el número exacto usando las pistas (+/-).</li>
        <li>Ganas <strong>75 puntos</strong> al acertar, más un <strong>bonus</strong> por los intentos que te sobren.</li>
        <li>Si fallas, pierdes 10 puntos.</li>
      </ul>
    </div>
  );

  return (
    <>
      <div className="setup-screen">
        <div className="setup-container">
          <h1>Casi Casi</h1>
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
          <div className="options-row">
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
              <h2>
                Modo de Juego
                <span className="instructions-icon" onClick={() => setIsModalOpen(true)}>(?)</span>
              </h2>
              <div className="segmented-control">
                <button 
                  className={gameMode === 'classic' ? 'active' : ''}
                  onClick={() => setGameMode('classic')}
                >
                  Clásico
                </button>
                <button 
                  className={gameMode === 'plusminus' ? 'active' : ''}
                  onClick={() => setGameMode('plusminus')}
                >
                  Más o Menos
                </button>
              </div>
            </div>
          </div>
          <button 
            className="start-game-btn"
            onClick={() => onGameStart(players, rounds, gameMode)}
            disabled={!canStart}
          >
            Empezar a Jugar
          </button>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {gameMode === 'classic' ? classicInstructions : plusminusInstructions}
      </Modal>
    </>
  );
};

export default SetupScreen;