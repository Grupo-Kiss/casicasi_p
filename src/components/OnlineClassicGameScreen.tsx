import React, { useState, useEffect } from 'react';
import { OnlineSession } from './OnlineSetupScreen';
import ClassicGameScreen from './ClassicGameScreen';
import { Question, Player } from '../types';
import TurnSwitcher from './TurnSwitcher';
import AnswerResult from './AnswerResult';

// Define la estructura del estado del juego que viene del servidor
interface GameState {
  screen: 'playing' | 'turn_switching' | 'answer_result';
  question: Question;
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  numberOfRounds: number;
  classicTimer: number;
  lastAnswer?: {
    userAnswer: string;
    scoreAwarded: number;
    resultType: 'CASI' | 'CASI_CASI' | 'LEJOS';
    timeUsed: number;
    timeBonus: number;
  };
}

interface OnlineClassicGameScreenProps {
  session: OnlineSession;
}

const OnlineClassicGameScreen: React.FC<OnlineClassicGameScreenProps> = ({ session }) => {
  const { socket, roomId, players: initialPlayers } = session;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Determina si el cliente actual es el host
  const isHost = initialPlayers.find(p => p.id === socket.id)?.isHost || false;

  useEffect(() => {
    // Listener para las actualizaciones de estado del juego desde el servidor
    socket.on('game-state-updated', (newGameState: GameState) => {
      setGameState(newGameState);
      setCurrentAnswer(''); // Limpiar la respuesta anterior
    });

    // El host es responsable de iniciar el juego una vez que el componente se monta
    if (isHost) {
      socket.emit('start-game', { roomId });
    }

    // Limpieza de listeners
    return () => {
      socket.off('game-state-updated');
    };
  }, [socket, roomId, isHost]);

  const handleAnswerSubmit = () => {
    socket.emit('submit-answer', { roomId, answer: currentAnswer });
  };

  const handleContinue = () => {
    socket.emit('next-state', { roomId });
  }

  if (!gameState) {
    return <div>Esperando a que el host inicie la partida...</div>;
  }

  const { screen, question, players, currentPlayerIndex, classicTimer, round, numberOfRounds, lastAnswer } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Traduce el resultado del servidor al tipo que espera el componente AnswerResult
  const getResultTypeForDisplay = (): keyof Player | null => {
    if (!lastAnswer) return null;
    switch (lastAnswer.resultType) {
      case 'CASI_CASI': return 'exactHits';
      case 'CASI': return 'correctHits';
      case 'LEJOS': return 'wrongHits';
      default: return null;
    }
  };

  if (screen === 'turn_switching') {
    return <TurnSwitcher player={currentPlayer} onTurnSwitchComplete={handleContinue} />;
  }

  if (screen === 'answer_result' && lastAnswer) {
    return <AnswerResult 
      question={question} 
      userAnswer={lastAnswer.userAnswer} 
      scoreAwarded={lastAnswer.scoreAwarded} 
      player={currentPlayer} 
      resultType={getResultTypeForDisplay()} 
      timeUsed={lastAnswer.timeUsed} 
      timeBonus={lastAnswer.timeBonus} 
      onContinue={handleContinue} 
    />;
  }

  return (
    <ClassicGameScreen
      question={question}
      players={players}
      currentPlayerIndex={currentPlayerIndex}
      currentAnswer={currentAnswer}
      onAnswerChange={setCurrentAnswer}
      onAnswerSubmit={handleAnswerSubmit}
      classicTimer={classicTimer}
      round={round}
      numberOfRounds={numberOfRounds}
    />
  );
};

export default OnlineClassicGameScreen;
