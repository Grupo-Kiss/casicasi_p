import { useState, useCallback, useEffect } from 'react';
import { Player } from '../types';
import { useQuestions } from './useQuestions';
import { usePlayers } from './usePlayers';
import { useGameFlow } from './useGameFlow';
import { useClassicRound } from './useClassicRound';
import { usePlusminusRound } from './usePlusminusRound';


// Hook principal que orquesta todo el estado y la lógica del juego.
export const useGameOrchestrator = () => {
  // Estado para la configuración del juego.
  const [numberOfRounds, setNumberOfRounds] = useState(10);
  const [gameMode, setGameMode] = useState<'classic' | 'plusminus'>('classic');

  // Hooks personalizados para manejar diferentes partes del estado del juego.
  const { 
    players, 
    currentPlayerIndex, 
    setInitialPlayers, 
    updatePlayerStats, 
    advanceToNextPlayer, 
    resetPlayers, 
    setPlayers 
  } = usePlayers();
  
  const { 
    gameScreen, 
    setGameScreen, 
    round, 
    setRound, 
    lastRoundScore, 
    setLastRoundScore, 
    highScore, 
    updateHighScore,
    lastRoundResultType,
    setLastRoundResultType,
    lastRoundTimeUsed,
    setLastRoundTimeUsed,
    lastRoundTimeBonus,
    setLastRoundTimeBonus
  } = useGameFlow();

  const { resetPlayedQuestions } = useQuestions();

  // Callback que se ejecuta al final de cada ronda.
  const onRoundEnd = useCallback((points: number, resultType: keyof Player, timeUsed: number, timeBonus: number) => {
    setGameScreen('showing_answer');
    setLastRoundScore(points);
    setLastRoundResultType(resultType);
    setLastRoundTimeUsed(timeUsed);
    setLastRoundTimeBonus(timeBonus);
    updatePlayerStats(points, resultType, timeUsed);
  }, [updatePlayerStats, setGameScreen, setLastRoundScore, setLastRoundResultType, setLastRoundTimeUsed, setLastRoundTimeBonus]);

  // Callback que se ejecuta cuando se pierde en el modo plusminus.
  const onPlusminusLose = useCallback(() => {
    onRoundEnd(0, 'wrongHits', 10, 0);
  }, [onRoundEnd]);

  // CONDITIONAL USE OF ROUND HOOKS
  const classicRound = useClassicRound(onRoundEnd, gameScreen);
  const plusminusRound = usePlusminusRound(onRoundEnd, onPlusminusLose, gameScreen);

  const currentRound = gameMode === 'classic' ? classicRound : plusminusRound;

  // Destructure common properties from currentRound
  const {
    currentQuestion,
    currentAnswer,
    setCurrentAnswer,
    nextQuestion,
  } = currentRound;

  // Destructure mode-specific properties
  const classicTimer = gameMode === 'classic' ? classicRound.classicTimer : undefined;
  const handleClassicAnswer = gameMode === 'classic' ? classicRound.handleClassicAnswer : undefined;

  const plusminusTimer = gameMode === 'plusminus' ? plusminusRound.plusminusTimer : undefined;
  const plusminusGuessesLeft = gameMode === 'plusminus' ? plusminusRound.plusminusGuessesLeft : undefined;
  const plusminusHint = gameMode === 'plusminus' ? plusminusRound.plusminusHint : undefined;
  const handlePlusminusGuess = gameMode === 'plusminus' ? plusminusRound.handlePlusminusGuess : undefined;
  const startPlusminusRound = gameMode === 'plusminus' ? plusminusRound.startPlusminusRound : undefined;
  const initialGuesses = gameMode === 'plusminus' ? plusminusRound.initialGuesses : undefined;


  // Función para avanzar el juego a la siguiente ronda o jugador.
  const advanceGame = useCallback(() => {
    if ((gameMode === 'classic' && round + 1 >= numberOfRounds) || (gameMode === 'plusminus' && round + 1 >= numberOfRounds)) {
      if (players.length > 0 && currentPlayerIndex + 1 >= players.length) {
        const finalPlayers = players.map(p => ({ ...p, score: p.score + 100 }));
        setPlayers(finalPlayers);

        const maxScore = Math.max(...finalPlayers.map(p => p.score));
        if (!highScore || maxScore > highScore.score) {
          const topPlayer = finalPlayers.find(p => p.score === maxScore);
          if (topPlayer) {
            updateHighScore(maxScore, topPlayer.name);
          }
        }
        setGameScreen('gameover');
      } else {
        setGameScreen('turn_switching');
        advanceToNextPlayer();
        setRound(1);
        resetPlayedQuestions();
        
        setGameScreen('playing');
        nextQuestion();
      }
    }
   else {
      setRound(prev => prev + 1);
      setGameScreen('playing');
      nextQuestion();
    }
  }, [round, currentPlayerIndex, players, numberOfRounds, highScore, gameMode, resetPlayedQuestions, advanceToNextPlayer, setPlayers, setRound, setGameScreen, updateHighScore, nextQuestion]);

  useEffect(() => {
    if (gameScreen === 'showing_answer') {
      setLastRoundScore(null);
      setLastRoundResultType(null);
      setLastRoundTimeUsed(null);
      setLastRoundTimeBonus(null);
    }
  }, [gameScreen]);

  // Función para inicializar el juego.
  const initializeGame = useCallback((newPlayers: Player[], rounds: number, mode: 'classic' | 'plusminus') => {
    const playersWithAvatars = newPlayers.map((player) => ({
      ...player,
      score: 100,
      totalTimeUsed: 0,
    }));

    setInitialPlayers(playersWithAvatars);
    setNumberOfRounds(rounds);
    setGameMode(mode);
    setRound(1);
    resetPlayedQuestions();
    
    setGameScreen('turn_switching');
  }, [setInitialPlayers, setNumberOfRounds, setGameMode, setRound, resetPlayedQuestions, setGameScreen]);

  useEffect(() => {
    if (gameScreen === 'playing' && currentQuestion === null) {
      nextQuestion();
    }
  }, [gameScreen, currentQuestion, nextQuestion]);

  // Función para reiniciar el juego.
  const handleReset = useCallback(() => {
    setGameScreen('setup');
    resetPlayers();
    setRound(0);
    resetPlayedQuestions();
    
  }, [setGameScreen, resetPlayers, setRound, resetPlayedQuestions]);

  // Retorna todo el estado y las funciones que necesita la UI.
  return {
    gameScreen,
    players,
    numberOfRounds,
    classicTimer,
    currentQuestion,
    currentAnswer,
    setCurrentAnswer,
    round,
    currentPlayerIndex,
    isShowingAnswer: gameScreen === 'showing_answer',
    lastRoundScore,
    initializeGame,
    handleAnswer: handleClassicAnswer,
    handleReset,
    highScore,
    plusminusGuessesLeft,
    plusminusHint,
    handlePlusminusGuess,
    plusminusTimer, 
    lastRoundResultType,
    lastRoundTimeUsed,
    lastRoundTimeBonus,
    setLastRoundTimeBonus,
    advanceGame,
    startPlusminusRound,
    gameMode,
    initialGuesses
  };
};
