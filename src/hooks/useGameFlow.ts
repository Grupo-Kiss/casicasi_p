import { useState, useEffect, useCallback } from 'react';
import { Player } from '../types';

// Hook para manejar el flujo y estado general del juego.
export const useGameFlow = () => {
  // Estado para la pantalla actual del juego.
  const [gameScreen, setGameScreen] = useState<'setup' | 'playing' | 'showing_answer' | 'turn_switching' | 'gameover' | 'plusminus_round'>('setup');
  // Estado para la ronda actual.
  const [round, setRound] = useState(0);
  // Estado para la puntuación de la última ronda.
  const [lastRoundScore, setLastRoundScore] = useState<number | null>(null);
  // Estado para la puntuación más alta.
  const [highScore, setHighScore] = useState<{ score: number; name: string } | null>(null);
  // Estado para indicar si una ronda ha terminado.
  const [roundEnded, setRoundEnded] = useState(false);
  // Estado para el tipo de resultado de la última ronda (exactHits, correctHits, wrongHits).
  const [lastRoundResultType, setLastRoundResultType] = useState<keyof Player | null>(null);
  // Estado para el tiempo utilizado en la última ronda.
  const [lastRoundTimeUsed, setLastRoundTimeUsed] = useState<number | null>(null);
  // Estado para la bonificación de tiempo de la última ronda.
  const [lastRoundTimeBonus, setLastRoundTimeBonus] = useState<number | null>(null);

  // Carga la puntuación más alta desde el localStorage al iniciar.
  useEffect(() => {
    const savedHighScore = localStorage.getItem('casiCasiHighScore');
    if (savedHighScore) {
      setHighScore(JSON.parse(savedHighScore));
    }
  }, []);

  // Actualiza la puntuación más alta y la guarda en el localStorage.
  const updateHighScore = useCallback((newScore: number, newName: string) => {
    const newHighScore = { score: newScore, name: newName };
    setHighScore(newHighScore);
    localStorage.setItem('casiCasiHighScore', JSON.stringify(newHighScore));
  }, []);

  // Retorna el estado y las funciones para ser utilizadas por otros hooks.
  return {
    gameScreen,
    setGameScreen,
    round,
    setRound,
    lastRoundScore,
    setLastRoundScore,
    highScore,
    updateHighScore,
    setRoundEnded, // 'roundEnded' no se usa directamente
    lastRoundResultType,
    setLastRoundResultType,
    lastRoundTimeUsed,
    setLastRoundTimeUsed,
    lastRoundTimeBonus,
    setLastRoundTimeBonus,
  };
};