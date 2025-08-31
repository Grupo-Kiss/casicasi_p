
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import './App.css';
import { useGameOrchestrator } from './hooks/useGameOrchestrator';
import AnswerResult from './components/AnswerResult';
import SetupScreen from './components/SetupScreen';
import GameStats from './components/GameStats';
import TurnSwitcher from './components/TurnSwitcher';
import ClassicGameScreen from './components/ClassicGameScreen';
import PlusminusGameScreen from './components/PlusminusGameScreen';

import DataUploader from './components/DataUploader';
import { QuestionsProvider, useQuestionsContext } from './hooks/QuestionsContext';
import OnlineSetupScreen, { OnlineSession } from './components/OnlineSetupScreen';
import OnlineClassicGameScreen from './components/OnlineClassicGameScreen';
import { Player } from './types';

function Game() {
  // --- STATE MANAGEMENT ---
  const [gamePhase, setGamePhase] = React.useState<'setup' | 'playing_local' | 'playing_online' | 'gameover_local'>('setup');
  const [onlineSession, setOnlineSession] = React.useState<OnlineSession | null>(null);

  // Hook para el juego local
  const localGame = useGameOrchestrator();

  // --- HANDLERS ---
  const handleStartLocalGame = (players: Player[], rounds: number, gameMode: 'classic' | 'plusminus') => {
    localGame.initializeGame(players, rounds, gameMode);
    setGamePhase('playing_local');
  };

  const handleStartOnlineGame = (session: OnlineSession) => {
    setOnlineSession(session);
    setGamePhase('playing_online');
  };

  const handleReset = () => {
    localGame.handleReset();
    setGamePhase('setup');
    setOnlineSession(null);
    // Redirigir a la raíz para limpiar la URL de la sala de juego
    window.location.href = '/';
  };

  // --- RENDER LOGIC ---
  if (gamePhase === 'setup') {
    // Aquí podrías tener un menú para elegir entre local y online.
    // Por ahora, derivamos al setup online si la URL tiene un ID de juego.
    const isOnlineJoin = window.location.pathname.includes('/game/');
    return isOnlineJoin 
      ? <OnlineSetupScreen onGameStart={handleStartOnlineGame} />
      : <SetupScreen onGameStart={handleStartLocalGame} />;
  }

  if (gamePhase === 'playing_online' && onlineSession) {
    // Renderiza el componente controlador del juego online
    return <OnlineClassicGameScreen session={onlineSession} />;
  }

  if (gamePhase === 'gameover_local') {
    return <GameStats players={localGame.players} onReset={handleReset} highScore={localGame.highScore} />;
  }

  // Renderiza el juego local si está en curso
  if (gamePhase === 'playing_local') {
    const { 
      gameScreen, players, numberOfRounds, classicTimer, currentQuestion, 
      currentAnswer, setCurrentAnswer, round, currentPlayerIndex, isShowingAnswer,
      lastRoundScore, advanceGame, gameMode, lastRoundResultType, lastRoundTimeUsed, 
      lastRoundTimeBonus, plusminusGuessesLeft, plusminusHint, handlePlusminusGuess, 
      plusminusTimer, initialGuesses
    } = localGame;

    const currentPlayer = players[currentPlayerIndex];

    if (gameScreen === 'turn_switching') {
      return <TurnSwitcher player={currentPlayer} onTurnSwitchComplete={advanceGame} />;
    }
    if (!currentQuestion) return <div>Cargando pregunta...</div>;
    if (isShowingAnswer && lastRoundScore !== null) {
      return <AnswerResult question={currentQuestion} userAnswer={currentAnswer} scoreAwarded={lastRoundScore} player={currentPlayer} resultType={lastRoundResultType} timeUsed={lastRoundTimeUsed} timeBonus={lastRoundTimeBonus} onContinue={advanceGame} />;
    }
    if (gameScreen === 'gameover') {
      // Actualizamos la fase principal del juego para mostrar GameStats
      setGamePhase('gameover_local');
      return null;
    }

    if (gameMode === 'plusminus') {
      return <PlusminusGameScreen
        question={currentQuestion}
        player={currentPlayer}
        guessesLeft={plusminusGuessesLeft as number}
        hint={plusminusHint as '+' | '-' | null}
        currentAnswer={currentAnswer}
        onAnswerChange={setCurrentAnswer}
        onGuessSubmit={handlePlusminusGuess as () => void}
        plusminusTimer={plusminusTimer as number}
        initialGuesses={initialGuesses as number}
      />;
    } else {
      return <ClassicGameScreen
        question={currentQuestion}
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        currentAnswer={currentAnswer}
        onAnswerChange={setCurrentAnswer}
        onAnswerSubmit={localGame.handleAnswer as () => void}
        classicTimer={classicTimer as number}
        round={round}
        numberOfRounds={numberOfRounds}
      />;
    }
  }

  // Fallback por si algo sale mal
  return <div>Error de estado. <button onClick={handleReset}>Reiniciar</button></div>;
}

const GlobalFooter = () => {
  const { questions, isLoading } = useQuestionsContext();
  return (
    <footer className="global-footer">
      (c) Moro Games 2025 - Cantidad de registros de juego: {isLoading ? '...' : questions.length}
    </footer>
  );
};

function App() {
  return (
    <QuestionsProvider>
      <Router>
        <div className="app-wrapper">
          <main className="content-wrapper">
            <Routes>
              <Route path="/" element={<Game />} />
              <Route path="/data" element={<DataUploader />} />
            </Routes>
          </main>
          <GlobalFooter />
        </div>
      </Router>
    </QuestionsProvider>
  );
}

export default App;
