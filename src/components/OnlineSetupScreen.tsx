import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player, GameMode } from '../types';
import { AVATARS } from '../constants/avatars';

// Conexión dinámica: En desarrollo apunta a localhost:3002, en producción al mismo host.
const SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3002';
// Se crea el socket UNA SOLA VEZ fuera del componente para que persista
const socket: Socket = io(SERVER_URL, {
  transports: ['websocket'],
  upgrade: false
});

export interface OnlineSession {
  socket: Socket;
  roomId: string;
  players: Player[];
}

interface OnlineSetupScreenProps {
  onGameStart: (session: OnlineSession) => void;
}

const OnlineSetupScreen: React.FC<OnlineSetupScreenProps> = ({ onGameStart }) => {
  const isGuest = window.location.pathname.includes('/game/');

  // Estado general
  const [view, setView] = useState<'host_setup' | 'host_waiting' | 'guest_join'>(isGuest ? 'guest_join' : 'host_setup');
  const [error, setError] = useState('');
  
  // Estado del formulario
  const [playerName, setPlayerName] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [numRounds, setNumRounds] = useState(5);

  // Estado de la sala
  const [roomId, setRoomId] = useState<string | null>(() => {
    return isGuest ? window.location.pathname.split('/game/').pop() || null : null;
  });
  const [shareableLink, setShareableLink] = useState('');
  const [playersInRoom, setPlayersInRoom] = useState<Player[]>([]);

    useEffect(() => {
    console.log(`[CLIENT] Montando OnlineSetupScreen en modo ${isGuest ? 'Invitado' : 'Host'}`);
    
    socket.on('connect', () => {
      console.log(`[CLIENT] Conectado al servidor con ID: ${socket.id}`);
    });

    const onPlayerJoined = (updatedPlayers: Player[]) => {
      console.log("[CLIENT] Actualización de jugadores en la sala:", updatedPlayers);
      setPlayersInRoom(updatedPlayers);
    };

    // Listener UNIVERSAL para iniciar el juego. Ambos (host e invitado) lo escucharán.
    const onGameStarted = () => {
      console.log(`%c[CLIENT] Recibido 'game-state-updated' (señal de inicio). Llamando a onGameStart...`, 'color: green; font-weight: bold;');
      // Usamos una función en setPlayersInRoom para asegurar que tenemos el estado más reciente
      setPlayersInRoom(currentPlayers => {
        // Asegurarse de que el estado de los jugadores no esté vacío antes de empezar
        if (roomId && currentPlayers.length > 0) {
            onGameStart({ socket, roomId, players: currentPlayers });
        }
        return currentPlayers;
      });
    };

    socket.on('player-joined', onPlayerJoined);
    // Usamos .once() para que este listener se ejecute una sola vez.
    socket.once('game-state-updated', onGameStarted);

    return () => {
      socket.off('player-joined', onPlayerJoined);
      socket.off('game-state-updated', onGameStarted);
    };
  }, [onGameStart, roomId, isGuest]);

  const handleCreateRoom = () => {
    if (!playerName) return setError('Por favor, introduce tu nombre.');
    console.log("[CLIENT-HOST] Emitiendo 'create-room'...");
    const gameConfig = { mode: gameMode, rounds: numRounds };
    socket?.emit('create-room', { playerName, gameConfig }, (response: { roomId: string }) => {
      console.log(`[CLIENT-HOST] Recibido callback de create-room. RoomId: ${response.roomId}`);
      const newRoomId = response.roomId;
      setRoomId(newRoomId);
      const link = `${window.location.origin}/game/${newRoomId}`;
      setShareableLink(link);
      window.history.pushState(null, '', `/game/${newRoomId}`);
      
      const hostPlayer: Player = { id: socket.id!, name: playerName, isHost: true, avatar: AVATARS[0], score: 0, exactHits: 0, correctHits: 0, wrongHits: 0, totalTimeUsed: 0 };
      setPlayersInRoom([hostPlayer]);
      setView('host_waiting');
    });
  };

  const handleJoinRoom = () => {
    if (!playerName || !roomId) return;
    console.log(`[CLIENT-GUEST] Emitiendo 'join-room' para sala ${roomId}...`);
    socket.emit('join-room', { roomId, playerName }, (response: { success: boolean; message?: string }) => {
      console.log('[CLIENT-GUEST] Recibido callback de join-room. Respuesta:', response);
      if (!response.success) {
        setError(response.message || 'Error al unirse a la sala.');
      }
      // Ya no llamamos a onGameStart aquí. Esperamos el evento 'game-state-updated'.
    });
  };

  // --- VISTAS DE RENDERIZADO ---

  if (view === 'host_setup') {
    return (
      <div className="setup-screen">
        <h2>Configurar Partida Online</h2>
        <input type="text" placeholder="Tu Nombre" value={playerName} onChange={e => setPlayerName(e.target.value)} />
        <select value={gameMode} onChange={e => setGameMode(e.target.value as GameMode)}>
          <option value="classic">Clásico</option>
          <option value="plusminus">Más/Menos</option>
        </select>
        <input type="number" value={numRounds} onChange={e => setNumRounds(parseInt(e.target.value, 10))} min="1" max="20" />
        <button onClick={handleCreateRoom}>Iniciar Juego</button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  if (view === 'host_waiting') {
    return (
      <div>
        <h2>¡Sala Creada!</h2>
        <p>Comparte esta URL con tu amigo:</p>
        <input type="text" value={shareableLink} readOnly style={{ width: '400px' }} />
        <hr />
        <h3>Esperando a que tu amigo se conecte...</h3>
        <ul>
          {playersInRoom.map(p => <li key={p.id}>{p.name} {p.isHost && '👑'}</li>)}
        </ul>
      </div>
    );
  }

  if (view === 'guest_join') {
    return (
      <div className="setup-screen">
        <h2>Unirse a la Partida</h2>
        <p>¡Estás a punto de unirte a una partida de CASI CASI!</p>
        <input type="text" placeholder="Tu Nombre" value={playerName} onChange={e => setPlayerName(e.target.value)} />
        <button onClick={handleJoinRoom}>Unirse</button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return <div>Cargando...</div>;
};

export default OnlineSetupScreen;