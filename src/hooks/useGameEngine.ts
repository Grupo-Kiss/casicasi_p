import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, Player } from '../types';

export const useGameEngine = () => {
  // Setup State
  const [players, setPlayers] = useState<Player[]>([]);
  const [numberOfRounds, setNumberOfRounds] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Game State
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [playedQuestions, setPlayedQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timer, setTimer] = useState(30);
  const [gameScreen, setGameScreen] = useState<'setup' | 'playing' | 'showing_answer' | 'turn_switching' | 'gameover'>('setup');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [lastRoundScore, setLastRoundScore] = useState<number | null>(null);
  const [highScore, setHighScore] = useState<{ score: number; name: string } | null>(null);

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

  const nextQuestion = useCallback(() => {
    const categoryQuestions = selectedCategory === 'all' 
      ? allQuestions 
      : allQuestions.filter(q => q.categoria === selectedCategory);

    if (categoryQuestions.length > 0) {
      const availableQuestions = categoryQuestions.filter(q => !playedQuestions.includes(q.pregunta));
      const questionPool = availableQuestions.length > 0 ? availableQuestions : categoryQuestions;
      const randomIndex = Math.floor(Math.random() * questionPool.length);
      const newQuestion = questionPool[randomIndex];
      
      setCurrentQuestion(newQuestion);
      setPlayedQuestions(prev => [...prev, newQuestion.pregunta]);
      setCurrentAnswer('');
      setTimer(30);
      setGameScreen('playing');
    }
  }, [allQuestions, playedQuestions, selectedCategory]);

  const advanceGame = useCallback(() => {
    if (round + 1 >= numberOfRounds) {
      if (currentPlayerIndex + 1 >= players.length) {
        const maxScore = Math.max(...players.map(p => p.score));
        if (!highScore || maxScore > highScore.score) {
          const topPlayer = players.find(p => p.score === maxScore);
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
          nextQuestion();
        }, 3000);
      }
    } else {
      setRound(prev => prev + 1);
      nextQuestion();
    }
  }, [round, currentPlayerIndex, players, numberOfRounds, nextQuestion, highScore]);

  const handleAnswer = useCallback((isTimeout = false) => {
    if (gameScreenRef.current !== 'playing') return;
    if (!currentQuestion) return;

    let points = 0;
    let resultType: keyof Player = 'wrongHits';
    let timeBonus = 0;

    if (isTimeout) {
      points = -20;
    } else {
      const answerNum = parseInt(currentAnswer.replace(/\./g, ''), 10);
      if (isNaN(answerNum)) {
        points = -50;
      } else {
        const { respuesta, rango_min, rango_max } = currentQuestion;
        const twentyPercent = Math.abs(respuesta * 0.2);
        
        // User request: incorrect answers (far) get a time bonus.
        points = -5;
        timeBonus = timer;

        if (answerNum === respuesta) {
          points = 150;
          timeBonus = timer;
          resultType = 'exactHits';
        } else if (answerNum >= rango_min && answerNum <= rango_max) {
          points = 50;
          timeBonus = timer;
          resultType = 'correctHits';
        } else if (Math.abs(answerNum - respuesta) <= twentyPercent) {
          points = 5;
          timeBonus = timer;
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
      player[resultType]++;
      newPlayers[currentPlayerIndex] = player;
      return newPlayers;
    });

    setTimeout(() => {
      setLastRoundScore(null);
      advanceGame();
    }, 5000);

  }, [currentAnswer, currentQuestion, currentPlayerIndex, advanceGame, players, timer]);

  useEffect(() => {
    if (gameScreen === 'playing') {
      if (timer > 0) {
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
      } else {
        console.log("Timer reached 0, calling handleAnswer(true)");
        handleAnswer(true);
      }
    }
  }, [timer, gameScreen, handleAnswer]);

  const initializeGame = (newPlayers: Player[], rounds: number, category: string) => {
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
      avatar: shuffledAvatars[index % AVATARS.length],
    }));

    setPlayers(playersWithAvatars);
    setNumberOfRounds(rounds);
    setSelectedCategory(category);
    setCurrentPlayerIndex(0);
    setRound(0);
    setPlayedQuestions([]);
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
  };
};