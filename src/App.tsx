
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

function Game() {
  const {
    gameScreen, players, numberOfRounds, classicTimer, currentQuestion, 
    currentAnswer, setCurrentAnswer, round, currentPlayerIndex, isShowingAnswer,
    lastRoundScore, initializeGame, handleAnswer, handleReset, highScore,
    plusminusGuessesLeft, plusminusHint, handlePlusminusGuess, plusminusTimer,
    lastRoundResultType, lastRoundTimeUsed, lastRoundTimeBonus, advanceGame,
    gameMode,
    initialGuesses
  } = useGameOrchestrator();

  const renderGameScreen = () => {
    const currentPlayer = players[currentPlayerIndex];
    if (gameScreen === 'turn_switching') {
      return <TurnSwitcher player={currentPlayer} onTurnSwitchComplete={advanceGame} />;
    }
    if (!currentQuestion) return <div>Cargando pregunta...</div>;
    if (isShowingAnswer && lastRoundScore !== null) {
      return <AnswerResult question={currentQuestion} userAnswer={currentAnswer} scoreAwarded={lastRoundScore} player={currentPlayer} resultType={lastRoundResultType} timeUsed={lastRoundTimeUsed} timeBonus={lastRoundTimeBonus} onContinue={advanceGame} />;
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
        onAnswerSubmit={handleAnswer as () => void}
        classicTimer={classicTimer as number}
        round={round}
        numberOfRounds={numberOfRounds}
      />;
    }
  };

  return (
    <div className="app-container">
      {gameScreen === 'setup' && <SetupScreen onGameStart={initializeGame} />}
      {gameScreen !== 'setup' && gameScreen !== 'gameover' && renderGameScreen()}
      {gameScreen === 'gameover' && <GameStats players={players} onReset={handleReset} highScore={highScore} />}
    </div>
  );
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
      <Router basename={process.env.PUBLIC_URL}>
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
