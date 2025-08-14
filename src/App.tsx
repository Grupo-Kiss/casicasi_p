import React from 'react';
import './styles/global.css';
import { useGameEngine } from './hooks/useGameEngine';
import AnswerResult from './components/AnswerResult';
import SetupScreen from './components/SetupScreen';
import GameStats from './components/GameStats';
import TurnSwitcher from './components/TurnSwitcher';
import GameScreen from './components/GameScreen';

function App() {
  const {
    gameScreen,
    players,
    numberOfRounds,
    timer,
    currentQuestion,
    currentAnswer,
    setCurrentAnswer,
    round,
    currentPlayerIndex,
    isShowingAnswer,
    lastRoundScore,
    initializeGame,
    handleAnswer,
    handleReset,
    highScore,
  } = useGameEngine();

  const renderGameScreen = () => {
    const currentPlayer = players[currentPlayerIndex];

    if (gameScreen === 'turn_switching') {
      return <TurnSwitcher player={currentPlayer} />;
    }

    if (!currentQuestion) return null;

    if (isShowingAnswer && lastRoundScore !== null) {
      return (
        <AnswerResult 
          question={currentQuestion} 
          userAnswer={currentAnswer}
          scoreAwarded={lastRoundScore}
          player={currentPlayer}
        />
      );
    }

    return (
      <GameScreen 
        question={currentQuestion}
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        currentAnswer={currentAnswer}
        onAnswerChange={setCurrentAnswer}
        onAnswerSubmit={() => handleAnswer(false)}
        timer={timer}
        round={round}
        numberOfRounds={numberOfRounds}
      />
    );
  };

  return (
    <div className="app-container">
      {gameScreen === 'setup' && <SetupScreen onGameStart={initializeGame} highScore={highScore} />}
      {gameScreen !== 'setup' && gameScreen !== 'gameover' && renderGameScreen()}
      {gameScreen === 'gameover' && <GameStats players={players} onReset={handleReset} highScore={highScore} />}
    </div>
  );
}

export default App;
