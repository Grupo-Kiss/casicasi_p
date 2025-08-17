
import { useState, useCallback } from 'react';
import { Player } from '../types';

// Hook para manejar el estado de los jugadores.
export const usePlayers = () => {
  // Estado para la lista de jugadores.
  const [players, setPlayers] = useState<Player[]>([]);
  // Estado para el índice del jugador actual.
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Función para establecer los jugadores iniciales.
  const setInitialPlayers = useCallback((initialPlayers: Player[]) => {
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
  }, []);

  // Función para actualizar las estadísticas de un jugador.
  const updatePlayerStats = useCallback((scoreChange: number, resultType: keyof Player, timeUsed: number) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const player = { ...newPlayers[currentPlayerIndex] };
      player.score = Math.max(0, player.score + scoreChange);
      player.totalTimeUsed += timeUsed;
      if (resultType) {
        player[resultType]++;
      }
      newPlayers[currentPlayerIndex] = player;
      return newPlayers;
    });
  }, [currentPlayerIndex]);

  // Función para avanzar al siguiente jugador.
  const advanceToNextPlayer = useCallback(() => {
    setCurrentPlayerIndex(prev => prev + 1);
  }, []);

  // Función para reiniciar el estado de los jugadores.
  const resetPlayers = useCallback(() => {
    setPlayers([]);
    setCurrentPlayerIndex(0);
  }, []);

  // El jugador actual.
  const currentPlayer = players[currentPlayerIndex];

  // Retorna el estado y las funciones para ser utilizadas por otros hooks.
  return {
    players,
    currentPlayerIndex,
    currentPlayer,
    setInitialPlayers,
    updatePlayerStats,
    advanceToNextPlayer,
    resetPlayers,
    setPlayers, // Exporta setPlayers para poder modificar los jugadores directamente.
  };
};