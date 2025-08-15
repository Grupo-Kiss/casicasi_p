import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, Player } from '../types';

export const useGameEngine = () => {
  // Setup State
  const [players, setPlayers] = useState<Player[]>([]);
  const [numberOfRounds, setNumberOfRounds] = useState(5);
  const [gameMode, setGameMode] = useState<'classic' | 'plusminus'>('classic');

  // Game State
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [playedQuestions, setPlayedQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timer, setTimer] = useState(30);
  const [gameScreen, setGameScreen] = useState<'setup' | 'playing' | 'showing_answer' | 'turn_switching' | 'gameover' | 'plusminus_round'>('setup');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [lastRoundScore, setLastRoundScore] = useState<number | null>(null);
  const [highScore, setHighScore] = useState<{ score: number; name: string } | null>(null);
  const [wildcardPlayed, setWildcardPlayed] = useState(false);

  // Plusminus State
  const [plusminusGuessesLeft, setPlusminusGuessesLeft] = useState(0);
  const [plusminusHint, setPlusminusHint] = useState<'+' | '-' | null>(null);
  const [plusminusTimer, setPlusminusTimer] = useState(10);

  const gameScreenRef = useRef(gameScreen);
  gameScreenRef.current = gameScreen;

  // Load High Score & Questions
  useEffect(() => {
    const savedHighScore = localStorage.getItem('casiCasiHighScore');
    if (savedHighScore) {
      setHighScore(JSON.parse(savedHighScore));
    }

    fetch('/questions.json')
      .then(response => response.json())
      .then((data: Question[]) => {
        const activeQuestions = data.filter(q => q.activa === 'SI');
        setAllQuestions(activeQuestions);
      })
      .catch(error => console.error('Error loading questions:', error));
  }, []);

  // --- Function Declarations in Dependency Order ---

  const selectNewQuestion = useCallback(() => {
    if (allQuestions.length === 0) return null;
    const availableQuestions = allQuestions.filter(q => !playedQuestions.includes(q.pregunta));
    const questionPool = availableQuestions.length > 0 ? availableQuestions : allQuestions;
    const randomIndex = Math.floor(Math.random() * questionPool.length);
    const newQuestion = questionPool[randomIndex];
    
    setCurrentQuestion(newQuestion);
    setPlayedQuestions(prev => [...prev, newQuestion.pregunta]);
    return newQuestion;
  }, [allQuestions, playedQuestions]);

  const startPlusminusRound = useCallback(() => {
    const newQuestion = selectNewQuestion();
    if (!newQuestion) return; // No questions available

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    setPlusminusGuessesLeft(dice1 + dice2);
    setPlusminusHint(null);
    setCurrentAnswer('');
    setPlusminusTimer(10);
    setWildcardPlayed(true); // Mark as played for this turn
    setGameScreen('plusminus_round');
  }, [selectNewQuestion]);

  const nextQuestion = useCallback(() => {
    const newQuestion = selectNewQuestion();
    if (!newQuestion) return; // No questions available

    setCurrentAnswer('');
    setTimer(30);

    if (gameMode === 'plusminus') {
      startPlusminusRound();
    } else {
      setGameScreen('playing');
    }
  }, [gameMode, startPlusminusRound, selectNewQuestion]);

  const advanceGame = useCallback(() => {
    if (gameMode === 'classic' && !wildcardPlayed && round + 1 === numberOfRounds) {
        startPlusminusRound();
        return;
    }

    if ((gameMode === 'classic' && round + 1 >= numberOfRounds) || (gameMode === 'plusminus' && round + 1 >= numberOfRounds)) {
      if (currentPlayerIndex + 1 >= players.length) {
        // --- Final Score Bonus --- 
        const finalPlayers = players.map(p => ({ ...p, score: p.score + 100 }));
        setPlayers(finalPlayers);
        // --- End of Final Score Bonus ---

        const maxScore = Math.max(...finalPlayers.map(p => p.score));
        if (!highScore || maxScore > highScore.score) {
          const topPlayer = finalPlayers.find(p => p.score === maxScore);
          if (topPlayer) {
            const newHighScore = { score: maxScore, name: topPlayer.name };
            setHighScore(newHighScore);
            localStorage.setItem('casiCasiHighScore', JSON.stringify(newHighScore));
          }
        }
        setGameScreen('gameover');
      } else {
        setGameScreen('turn_switching');
        setTimeout(() => {
          setCurrentPlayerIndex(prev => prev + 1);
          setRound(0);
          setPlayedQuestions([]);
          setWildcardPlayed(false); // Reset for next player
          nextQuestion();
        }, 3000);
      }
    } else {
      setRound(prev => prev + 1);
      nextQuestion();
    }
  }, [round, currentPlayerIndex, players, numberOfRounds, nextQuestion, highScore, gameMode, startPlusminusRound, wildcardPlayed]);

  const handleAnswer = useCallback((isTimeout = false) => {
    if (gameScreenRef.current !== 'playing') return;
    if (!currentQuestion) return;

    let points = 0;
    let timeBonus = 0;
    let resultType: keyof Player = 'wrongHits';
    const timeUsed = 30 - timer;

    if (isTimeout) {
      points = -20;
    } else {
      const answerNum = parseInt(currentAnswer.replace(/\./g, ''), 10);
      if (isNaN(answerNum)) {
        points = -25;
      } else {
        const { respuesta, rango_min, rango_max } = currentQuestion;
        const diff = Math.abs(answerNum - respuesta);

        if (answerNum === respuesta) {
          points = 150;
          timeBonus = timer;
          resultType = 'exactHits';
        } else if (answerNum >= rango_min && answerNum <= rango_max) {
          points = 50;
          timeBonus = timer;
          resultType = 'correctHits';
        } else if (diff <= respuesta * 0.10) {
          points = 15;
          timeBonus = timer;
        } else if (diff <= respuesta * 0.20) {
          points = 10;
          timeBonus = timer;
        } else if (diff <= respuesta * 0.30) {
          points = 5;
          timeBonus = timer;
        } else {
          points = 0;
        }
      }
    }

    const totalPoints = points + timeBonus;

    setGameScreen('showing_answer');
    setLastRoundScore(totalPoints);
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const player = { ...newPlayers[currentPlayerIndex] };
      player.score = Math.max(0, player.score + totalPoints);
      player.totalTimeUsed += timeUsed;
      player[resultType]++;
      newPlayers[currentPlayerIndex] = player;
      return newPlayers;
    });

    setTimeout(() => {
      setLastRoundScore(null);
      advanceGame();
    }, 5000);

  }, [currentAnswer, currentQuestion, currentPlayerIndex, advanceGame, players, timer]);

  const losePlusminus = useCallback(() => {
    const scoreChange = gameMode === 'classic' ? -50 : -10;
    const timeUsed = 10 - plusminusTimer;
    setLastRoundScore(scoreChange);
    setPlayers(prev => {
        const newPlayers = [...prev];
        const player = { ...newPlayers[currentPlayerIndex] };
        player.score = Math.max(0, player.score + scoreChange);
        player.totalTimeUsed += timeUsed;
        newPlayers[currentPlayerIndex] = player;
        return newPlayers;
    });

    setGameScreen('showing_answer');
    setTimeout(() => {
        setLastRoundScore(null);
        advanceGame();
    }, 5000);
  }, [advanceGame, currentPlayerIndex, plusminusTimer, gameMode]);

  const handlePlusminusGuess = useCallback(() => {
    if (!currentQuestion) return;

    const guessNum = parseInt(currentAnswer.replace(/\./g, ''), 10);
    const timeUsed = 10 - plusminusTimer;

    if (isNaN(guessNum)) { // Handle invalid number guess
        if (plusminusGuessesLeft - 1 <= 0) {
            losePlusminus();
        } else {
            setPlusminusGuessesLeft(prev => prev - 1);
            setCurrentAnswer('');
            setPlusminusTimer(10);
        }
        return;
    }

    const correctAnswer = currentQuestion.respuesta;

    if (guessNum === correctAnswer) {
      // WIN
      let scoreChange = 0;
      if (gameMode === 'classic') {
        scoreChange = 250; // Big bonus for wildcard
      } else {
        const guessesBonus = plusminusGuessesLeft * 5; // Bonus for remaining attempts
        scoreChange = 75 + guessesBonus;
      }

      setLastRoundScore(scoreChange);

      setPlayers(prev => {
        const newPlayers = [...prev];
        const player = { ...newPlayers[currentPlayerIndex] };
        player.score += scoreChange;
        player.totalTimeUsed += timeUsed;
        newPlayers[currentPlayerIndex] = player;
        return newPlayers;
      });

      setGameScreen('showing_answer');
      setTimeout(() => {
        setLastRoundScore(null);
        advanceGame();
      }, 5000);

    } else {
      // HINT & CONTINUE
      if (plusminusGuessesLeft - 1 <= 0) {
        losePlusminus();
      } else {
        setPlusminusHint(guessNum < correctAnswer ? '+' : '-');
        setPlusminusGuessesLeft(prev => prev - 1);
        setCurrentAnswer('');
        setPlusminusTimer(10);
      }
    }
  }, [currentAnswer, currentQuestion, players, currentPlayerIndex, plusminusGuessesLeft, advanceGame, losePlusminus, plusminusTimer]);

  const handlePlusminusTimeout = useCallback(() => {
    if (gameScreenRef.current !== 'plusminus_round') return;
    if (plusminusGuessesLeft - 1 <= 0) {
      losePlusminus();
    } else {
      setPlusminusGuessesLeft(prev => prev - 1);
      setPlusminusTimer(10);
      setPlusminusHint(null); // No hint on timeout
    }
  }, [plusminusGuessesLeft, losePlusminus]);

  // --- Timers and Effects ---

  // Classic Timer
  useEffect(() => {
    if (gameScreen === 'playing') {
      if (timer > 0) {
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
      } else {
        handleAnswer(true);
      }
    }
  }, [timer, gameScreen, handleAnswer]);

  // Plusminus Timer
  useEffect(() => {
    if (gameScreen === 'plusminus_round') {
      if (plusminusTimer > 0) {
        const interval = setInterval(() => setPlusminusTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
      } else {
        handlePlusminusTimeout();
      }
    }
  }, [gameScreen, plusminusTimer, handlePlusminusTimeout]);

  const initializeGame = (newPlayers: Player[], rounds: number, mode: 'classic' | 'plusminus') => {
    const AVATARS = [
      'https://moroarte.com/wp-content/uploads/2025/08/3d_chibi_anime_sty_image.jpeg',
      'https://moroarte.com/wp-content/uploads/2025/08/61d93795518eba9635e84f473f435d2b7e2a6a169a79acd33a5c21f6f17ba991.png',
      'https://moroarte.com/wp-content/uploads/2025/08/chibify-1747941995219.jpg',
      'https://moroarte.com/wp-content/uploads/2025/08/chibify-1747941999584.jpg',
      'https://moroarte.com/wp-content/uploads/2025/08/chibify-1747942008333.jpg'
    ];
    const shuffledAvatars = AVATARS.sort(() => 0.5 - Math.random());

    const playersWithAvatars = newPlayers.map((player, index) => ({
      ...player,
      score: 100, // Start all players with 100 points
      avatar: shuffledAvatars[index % AVATARS.length],
    }));

    setPlayers(playersWithAvatars);
    setNumberOfRounds(rounds);
    setGameMode(mode);
    setCurrentPlayerIndex(0);
    setRound(0);
    setPlayedQuestions([]);
    setWildcardPlayed(false); // Reset for new game
    setGameScreen('turn_switching');
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const handleReset = () => {
    setGameScreen('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setRound(0);
    setWildcardPlayed(false); // Reset for new game
  };

  return {
    gameScreen,
    players,
    numberOfRounds,
    timer,
    currentQuestion,
    currentAnswer,
    setCurrentAnswer,
    round,
    currentPlayerIndex,
    isShowingAnswer: gameScreen === 'showing_answer',
    lastRoundScore,
    initializeGame,
    handleAnswer,
    handleReset,
    highScore,
    // Plusminus props
    plusminusGuessesLeft,
    plusminusHint,
    handlePlusminusGuess,
    plusminusTimer
  };
};
