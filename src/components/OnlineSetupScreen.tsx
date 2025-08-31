
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player } from '../types'; // Importa el tipo Player global
import { AVATARS } from '../constants/avatars';

// Define la información de la sesión online
export interface OnlineSession {
  socket: Socket;
  roomId: string;
  players: Player[];
}

interface OnlineSetupScreenProps {
  onGameStart: (session: OnlineSession) => void;
}

const OnlineSetupScreen: React.FC<OnlineSetupScreenProps> = ({ onGameStart }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);

  // Efecto para conectar al servidor de Socket.IO y manejar la lógica de la URL
  useEffect(() => {
    const newSocket = io('http://localhost:3001'); // URL de tu servidor
    setSocket(newSocket);

    const pathRoomId = window.location.pathname.split('/').pop();
    if (pathRoomId && pathRoomId.length === 5) {
      setRoomId(pathRoomId);
      setIsHost(false);
    }

    newSocket.on('player-joined', (updatedPlayers: Player[]) => {
      console.log('Un jugador se ha unido:', updatedPlayers);
      setPlayers(updatedPlayers);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Efecto para iniciar el juego cuando la sala está llena
  useEffect(() => {
    if (players.length === 2 && socket && roomId) {
      // Ambos jugadores están listos, notificar al componente padre (App.tsx)
      onGameStart({ socket, roomId, players });
    }
  }, [players, socket, roomId, onGameStart]);

  const handleCreateRoom = () => {
    if (!playerName) {
      setError('Por favor, introduce tu nombre.');
      return;
    }
    socket?.emit('create-room', playerName, (response: { roomId: string }) => {
      const newRoomId = response.roomId;
      setRoomId(newRoomId);
      setIsHost(true);
      const link = `${window.location.origin}/game/${newRoomId}`;
      setShareableLink(link);
      window.history.pushState(null, '', `/game/${newRoomId}`);
      
      // Crear jugador Host con todos los campos requeridos
      const hostPlayer: Player = {
        id: socket.id!,
        name: playerName,
        isHost: true,
        avatar: AVATARS[0], // Asignar un avatar por defecto
        score: 0,
        exactHits: 0,
        correctHits: 0,
        wrongHits: 0,
        totalTimeUsed: 0
      };
      setPlayers([hostPlayer]);
    });
  };

  const handleJoinRoom = () => {
    if (!playerName) {
      setError('Por favor, introduce tu nombre.');
      return;
    }
    if (!roomId) {
        setError('No se encontró un ID de sala válido.');
        return;
    }
    socket?.emit('join-room', { roomId, playerName }, (response: { success: boolean; message?: string; players?: Player[] }) => {
      if (response.success) {
        console.log('Te has unido a la sala con éxito.', response.players);
        setPlayers(response.players || []);
      } else {
        setError(response.message || 'Error al unirse a la sala.');
      }
    });
  };

  // --- Renderizado del Componente ---

  // Si el juego ya empezó (manejado por App.tsx), este componente no debería mostrar nada relevante.
  if (players.length === 2) {
    return <div>Iniciando partida...</div>;
  }

  // Si el host ya creó la sala, muestra el enlace para compartir
  if (isHost && shareableLink) {
    return (
      <div>
        <h2>¡Sala Creada!</h2>
        <p>Comparte este enlace con tu amigo:</p>
        <input type="text" value={shareableLink} readOnly style={{ width: '300px' }} />
        <p>Esperando a que se una el segundo jugador...</p>
        <div>
            <h4>Jugadores Conectados:</h4>
            <ul>{players.map(p => <li key={p.id}>{p.name} {p.isHost && '(Host)'}</li>)}</ul>
        </div>
      </div>
    );
  }

  // Si es un invitado (entró con un enlace), muestra la pantalla para unirse
  if (roomId && !isHost) {
    return (
      <div>
        <h2>Unirse a la Partida</h2>
        <p>Te estás uniendo a la sala: <strong>{roomId}</strong></p>
        <input 
          type="text" 
          placeholder="Introduce tu nombre" 
          value={playerName} 
          onChange={(e) => setPlayerName(e.target.value)} 
        />
        <button onClick={handleJoinRoom}>Unirse al Juego</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  // Pantalla inicial para el host
  return (
    <div>
      <h2>Configuración del Juego Online</h2>
      <input 
        type="text" 
        placeholder="Introduce tu nombre" 
        value={playerName} 
        onChange={(e) => setPlayerName(e.target.value)} 
      />
      <button onClick={handleCreateRoom}>Crear Partida</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default OnlineSetupScreen;
