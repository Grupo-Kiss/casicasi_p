import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useGameEngine } from './hooks/useGameEngine';
import Scoreboard from './components/Scoreboard';
import Timer from './components/Timer';
import QuestionCard from './components/QuestionCard';
import PlayerInput from './components/PlayerInput';
import AnswerResult from './components/AnswerResult';
import SetupScreen from './components/SetupScreen';
import GameStats from './components/GameStats';

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
      if (!currentPlayer) return null;
      return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
          <h3>Turno de</h3>
          <h1>
        <img
          src={currentPlayer.avatar}
          alt={currentPlayer.name}
          style={{ width: '250px', height: '250px' }} // Estilo en línea para el tamaño
          className="player-avatar ms-2"
        />
        <br>
          </br><h1>{currentPlayer.name}</h1>
      </h1>
          <br>
          </br>
          <p className="lead">¡Preparate!</p>
        </div>
      );
    }

    if (!currentQuestion) return null;

    if (isShowingAnswer && lastRoundScore !== null) {
      return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
          <AnswerResult 
            question={currentQuestion} 
            userAnswer={currentAnswer}
            scoreAwarded={lastRoundScore} 
          />
        </div>
      );
    }

    return (
     <div className="d-flex flex-column h-100 justify-content-between">
  
  <div className="game-hud-bottom">
    <div className="text-center">
            <h5 className="mb-2">Ronda {round + 1} de {numberOfRounds}</h5>
            <Timer timeLeft={timer} />
          </div>
  </div>
      
        
        <div className="two-column-layout">
          <div className="column">
            <QuestionCard question={currentQuestion} />
          </div>
          <div className="column">
            <PlayerInput
              value={currentAnswer}
              onChange={setCurrentAnswer}
              onSubmit={() => {
                console.log("Submit button clicked, calling handleAnswer(false)");
                handleAnswer(false);
              }}
            />
          </div>
        </div>

        <div className="game-hud-top" style={{ margin: '30px 0 0 0' }}>
    <Scoreboard players={players} currentPlayerIndex={currentPlayerIndex} />
</div>
      </div>
      
    );
  };

  return (
    <div className="container mt-0">
      <div className="card shadow-sm border-0">
        <div className="card-body p-lg-5">
          {gameScreen === 'setup' && (
            <div className="text-center mb-0">
              <img 
                src="https://moroarte.com/wp-content/uploads/2023/11/casi-casi_logo.png" 
                alt="Casi Casi Logo"
                style={{ maxHeight: '40px' }}
              />
            </div>
          )}

          {gameScreen === 'setup' && <SetupScreen onGameStart={initializeGame} highScore={highScore} />}
          {gameScreen !== 'setup' && gameScreen !== 'gameover' && renderGameScreen()}
          {gameScreen === 'gameover' && <GameStats players={players} onReset={handleReset} highScore={highScore} />}
        </div>
      </div>
    </div>
  );
}

export default App;