import React, { useState, useEffect } from 'react';
import { Player, GameMode } from '../types';
import '../styles/SetupScreen.css';
import Modal from './Modal';
import { useEnterToContinue } from '../hooks/useEnterToContinue';

import { io, Socket } from 'socket.io-client';

// --- Lógica de Conexión Online ---
const SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3002';
const socket: Socket = io(SERVER_URL, {
  transports: ['websocket'],
  upgrade: false
});

interface SetupScreenProps {
  onGameStart: (players: Player[], rounds: number, gameMode: 'classic' | 'plusminus') => void;
  onOnlineGameStart: (session: { socket: Socket; roomId: string; players: Player[] }) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onGameStart, onOnlineGameStart }) => {
  const isGuest = window.location.pathname.includes('/game/');

  // Estado de la vista (local_setup, host_waiting, guest_join, host_ready_to_start, guest_waiting_for_host)
  const [view, setView] = useState<'local_setup' | 'host_waiting' | 'guest_join' | 'host_ready_to_start' | 'guest_waiting_for_host'>(isGuest ? 'guest_waiting_for_host' : 'local_setup');

  // --- Estados para la configuración del juego ---
  const [players, setPlayers] = useState<Player[]>([
    { name: '', avatar: AVATARS[0], score: 0, exactHits: 0, correctHits: 0, wrongHits: 0, totalTimeUsed: 0 },
  ]);
  const [rounds, setRounds] = useState(10);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Estados para el juego online ---
  const [error, setError] = useState('');
  const [roomId, setRoomId] = useState<string | null>(() => {
    return isGuest ? window.location.pathname.split('/game/').pop() || null : null;
  });
  const [shareableLink, setShareableLink] = useState('');
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);

  // --- Efectos para el juego online ---
  useEffect(() => {
    if (view === 'local_setup') return; // No activar listeners en setup local

    console.log(`[CLIENT] Montando SetupScreen en modo ${isGuest ? 'Invitado' : 'Host'}`);
    socket.on('connect', () => console.log(`[CLIENT] Conectado al servidor con ID: ${socket.id}`));

    // Lógica específica para el invitado esperando al host
    if (isGuest && view === 'guest_waiting_for_host') {
      const checkStatus = () => {
        if (!roomId) return;
        socket.emit('check-room-status', { roomId }, (response: { status: string; hostName?: string }) => {
          console.log('[CLIENT-GUEST] Estado de sala recibido:', response);
          if (response.status === 'ready_to_join') {
            setPlayerName(response.hostName ? `Invitado de ${response.hostName}` : ''); // Sugerir nombre
            setView('guest_join');
          } else if (response.status === 'game_started') {
            // Si el juego ya empezó, intentar unirse directamente (esto puede fallar si ya está lleno)
            handleJoinOnlineRoom(); // Intentar unirse, el servidor validará
          } else {
            // Sala no encontrada o error, seguir esperando o mostrar mensaje
            setError('Esperando al host o sala no encontrada.');
          }
        });
      };
      // Verificar estado cada 3 segundos
      const interval = setInterval(checkStatus, 3000);
      checkStatus(); // Verificar inmediatamente
      return () => clearInterval(interval);
    }

    const onPlayerJoined = (updatedPlayers: Player[]) => {
      console.log("[CLIENT] Actualización de jugadores en la sala:", updatedPlayers);
      setOnlinePlayers(updatedPlayers);
      if (updatedPlayers.length === 2 && view === 'host_waiting') {
        setView('host_ready_to_start'); // El host ve el botón de iniciar
      }
    };

    const onGameStarted = () => {
      console.log(`%c[CLIENT] Recibido 'game-state-updated' (señal de inicio). Llamando a onOnlineGameStart...`, 'color: green; font-weight: bold;');
      setOnlinePlayers(currentPlayers => {
        if (roomId && currentPlayers.length > 0) {
          onOnlineGameStart({ socket, roomId, players: currentPlayers });
        }
        return currentPlayers;
      });
    };

    socket.on('player-joined', onPlayerJoined);
    socket.once('game-state-updated', onGameStarted);

    return () => {
      socket.off('player-joined', onPlayerJoined);
      socket.off('game-state-updated', onGameStarted);
    };
  }, [view, onOnlineGameStart, roomId, isGuest]);

  // --- Handlers para Jugadores Locales ---
  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const handleAvatarChange = (playerIndex: number, direction: 'next' | 'prev') => {
    const currentAvatarIndex = AVATARS.indexOf(players[playerIndex].avatar);
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentAvatarIndex + 1) % AVATARS.length;
    } else {
      newIndex = (currentAvatarIndex - 1 + AVATARS.length) % AVATARS.length;
    }
    const newPlayers = [...players];
    newPlayers[playerIndex].avatar = AVATARS[newIndex];
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    if (players.length < 4) {
      const defaultAvatar = AVATARS[players.length % AVATARS.length];
      setPlayers([...players, { name: '', avatar: defaultAvatar, score: 0, exactHits: 0, correctHits: 0, wrongHits: 0, totalTimeUsed: 0 }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const canStartLocal = players.every(p => p.name.trim() !== '');

  // --- Handlers para Online ---
  const handleCreateOnlineRoom = () => {
    const hostPlayer = players[0];
    if (!hostPlayer || !hostPlayer.name.trim()) {
      setError('Por favor, introduce tu nombre.');
      return;
    }
    setError('');
    console.log("[CLIENT-HOST] Emitiendo 'create-room'...");
    const gameConfig = { mode: gameMode, rounds: rounds };
    socket.emit('create-room', { playerName: hostPlayer.name, gameConfig }, (response: { roomId: string }) => {
      console.log(`[CLIENT-HOST] Recibido callback de create-room. RoomId: ${response.roomId}`);
      const newRoomId = response.roomId;
      setRoomId(newRoomId);
      const link = `${window.location.origin}/game/${newRoomId}`;
      setShareableLink(link);
      window.history.pushState(null, '', `/game/${newRoomId}`);
      
      const onlineHostPlayer: Player = { ...hostPlayer, id: socket.id!, isHost: true };
      setOnlinePlayers([onlineHostPlayer]);
      setView('host_waiting');
    });
  };

  const handleJoinOnlineRoom = () => {
    const guestName = players[0].name;
    if (!guestName || !roomId) return;
    console.log(`[CLIENT-GUEST] Emitiendo 'join-room' para sala ${roomId}...`);
    socket.emit('join-room', { roomId, playerName: guestName }, (response: { success: boolean; message?: string }) => {
      console.log('[CLIENT-GUEST] Recibido callback de join-room. Respuesta:', response);
      if (!response.success) {
        setError(response.message || 'Error al unirse a la sala.');
      }
    });
  };

  const handleExplicitStartGame = () => {
    if (!roomId) return;
    console.log('[CLIENT-HOST] Host haciendo clic en Iniciar Partida. Emitiendo 'start-game-explicit'...');
    socket.emit('start-game-explicit', { roomId });
  };

  // Usar el hook para manejar Enter para iniciar el juego local
  useEnterToContinue(() => {
    if (canStartLocal && view === 'local_setup') {
      onGameStart(players, rounds, gameMode);
    }
  });

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

  // --- VISTAS DE RENDERIZADO ---

  if (view === 'guest_waiting_for_host') {
    return (
      <div className="setup-screen">
        <h2>Esperando al Host...</h2>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  if (view === 'guest_join') {
    return (
      <div className="setup-screen">
        <input
          type="text"
          placeholder={`Tu Nombre`}
          value={players[0].name}
          onChange={(e) => handlePlayerNameChange(0, e.target.value)}
        />
        <button className="start-game-btn" onClick={handleJoinOnlineRoom} disabled={!players[0].name.trim()}>Unirse a la Partida</button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  if (view === 'host_waiting') {
    return (
      <div className="setup-screen">
        <h2>¡Partida Online Creada!</h2>
        <p>Tu URL de partida local es: <strong>{shareableLink}</strong></p>
        <p>Para que tu amigo se una, necesitas la URL de tu túnel de ngrok.</p>
        <p><strong>1. Copia la URL de tu terminal de ngrok</strong> (ej. `https://tu-tunel.ngrok-free.app`).</p>
        <p><strong>2. Combínala con el ID de la sala:</strong></p>
        <p><code>{`https://<TU_URL_NGROK>/game/${roomId}`}</code></p>
        <p><strong>Ejemplo:</strong> `https://tu-tunel.ngrok-free.app/game/{roomId}`</p>
        <hr />
        <h3>Esperando al invitado...</h3>
        <ul>
          {onlinePlayers.map(p => <li key={p.id}>{p.name} {p.isHost && '👑'}</li>)}
        </ul>
      </div>
    );
  }

  if (view === 'host_ready_to_start') {
    return (
      <div className="setup-screen">
        <h2>¡Invitado Unido!</h2>
        <p>Tu amigo se ha conectado. ¡Están listos para jugar!</p>
        <ul>
          {onlinePlayers.map(p => <li key={p.id}>{p.name} {p.isHost && '👑'}</li>)}
        </ul>
        <button className="start-game-btn" onClick={handleExplicitStartGame}>
          Iniciar Partida
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  // Vista por defecto: local_setup
  return (
    <>
      <div className="setup-screen">
        <div className="setup-container">
          <img src="/img/casi-casi_logo.png" alt="Casi Casi Logo" className="casi-casi-logo" />

          {/* --- SECCIÓN DE PARTIDA ONLINE --- */}
          <div className="online-setup-section">
            <h2>Crear Partida Online</h2>
            <div className="player-input-group">
              <div className="avatar-selector">
                <button onClick={() => handleAvatarChange(0, 'prev')}>&lt;</button>
                <img src={players[0].avatar} alt={`Avatar para ${players[0].name}`} className="player-avatar" />
                <button onClick={() => handleAvatarChange(0, 'next')}>&gt;</button>
              </div>
              <input
                type="text"
                placeholder="Tu Nombre (Host)"
                value={players[0].name}
                onChange={(e) => handlePlayerNameChange(0, e.target.value)}
              />
            </div>
            <div className="options-row">
              <div className="options-group">
                <h3>RONDAS</h3>
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
                <h3>
                  MODO
                  <span className="instructions-icon" onClick={() => setIsModalOpen(true)}>(?)</span>
                </h3>
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
                    +/-
                  </button>
                </div>
              </div>
            </div>
            <button 
              className="start-game-btn online"
              onClick={handleCreateOnlineRoom}
              disabled={!players[0].name.trim()}
            >
              Crear Partida Online
            </button>
            {error && <p className="error">{error}</p>}
            <hr />
            <h2>O Jugar Local</h2>
          </div>

          {/* --- SECCIÓN DE PARTIDA LOCAL (EXISTENTE) --- */}
          <div className="setup-main-content">
            <div className="player-setup">
              <div className="player-inputs">
                {players.map((player, index) => (
                  <div className="player-input-group" key={index}>
                    {index > 0 && (
                      <div className="avatar-selector">
                        <button onClick={() => handleAvatarChange(index, 'prev')}>&lt;</button>
                        <img src={player.avatar} alt={`Avatar para ${player.name}`} className="player-avatar" />
                        <button onClick={() => handleAvatarChange(index, 'next')}>&gt;</button>
                      </div>
                    )}
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
            </div>
            <div className="options-setup">
              <div className="options-row">
                <div className="options-group">
                  <h3>PREGUNTAS</h3>
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
                <h3>
                  MODO
                  <span className="instructions-icon" onClick={() => setIsModalOpen(true)}>(?)</span>
                </h3>
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
                    +/-
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* --- BOTÓN DE JUEGO LOCAL --- */}
          <button 
            className="start-game-btn"
            onClick={() => onGameStart(players, rounds, gameMode)}
            disabled={!canStartLocal}
          >
            Empezar Juego Local
          </button>

        </div>
        
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {gameMode === 'classic' ? classicInstructions : plusminusInstructions}
      </Modal>
    </>
  );
};