
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configuración de CORS para permitir conexiones desde tu cliente de React
const io = new Server(server, {
  cors: {
    origin: "*", // Permite cualquier origen. ¡Solo para desarrollo!
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

const rooms = {};

const fs = require('fs');

// Cargar preguntas desde el archivo JSON
let allQuestions = [];
try {
  const questionsData = fs.readFileSync('../public/questions.json', 'utf8');
  allQuestions = JSON.parse(questionsData);
  console.log(`Se cargaron ${allQuestions.length} preguntas.`);
} catch (error) {
  console.error('Error al cargar las preguntas:', error);
  process.exit(1);
}

const getNewQuestion = (excludeIds = []) => {
  const availableQuestions = allQuestions.filter(q => !excludeIds.includes(q.id));
  if (availableQuestions.length === 0) return null; // No more questions
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};

// --- Lógica de Juego --- 
const createInitialGameState = (players) => {
  const firstQuestion = getNewQuestion();
  return {
    screen: 'playing',
    question: firstQuestion,
    players,
    currentPlayerIndex: 0,
    round: 1,
    numberOfRounds: 5, // Se puede hacer configurable
    classicTimer: 30,
    usedQuestions: [firstQuestion.id],
  };
};

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // ... (eventos create-room y join-room existentes)
  socket.on('create-room', (playerName, callback) => {
    const roomId = Math.random().toString(36).substring(2, 7); // Genera un ID de sala aleatorio
    rooms[roomId] = {
      players: [{ id: socket.id, name: playerName, isHost: true, score: 0 }],
      gameState: null,
    };
    socket.join(roomId);
    console.log(`Jugador ${playerName} (${socket.id}) creó y se unió a la sala ${roomId}`);
    callback({ roomId });
  });

  socket.on('join-room', ({ roomId, playerName }, callback) => {
    const room = rooms[roomId];
    if (room && room.players.length < 2) {
      room.players.push({ id: socket.id, name: playerName, isHost: false, score: 0 });
      socket.join(roomId);
      console.log(`Jugador ${playerName} (${socket.id}) se unió a la sala ${roomId}`);
      io.to(roomId).emit('player-joined', room.players);
      callback({ success: true, players: room.players });
    } else {
      callback({ success: false, message: 'La sala no existe o está llena.' });
    }
  });

  // Evento para iniciar el juego (enviado por el host)
  socket.on('start-game', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.players.find(p => p.id === socket.id)?.isHost) {
      console.log(`Iniciando juego en la sala ${roomId}`);
      room.gameState = createInitialGameState(room.players);
      io.to(roomId).emit('game-state-updated', room.gameState);
    }
  });

  // Evento para manejar la respuesta de un jugador
  socket.on('submit-answer', ({ roomId, answer }) => {
    const room = rooms[roomId];
    if (!room || !room.gameState) return;

    const { gameState } = room;
    const correctAnswer = gameState.question.respuesta;
    const diff = Math.abs(correctAnswer - parseInt(answer, 10));
    let score = 0;
    if (diff === 0) score = 100;
    else if (diff <= 5) score = 50;
    else if (diff <= 10) score = 25;

    // Actualizar puntaje
    gameState.players[gameState.currentPlayerIndex].score += score;

    // Preparar el estado de "resultado"
    gameState.screen = 'answer_result';
    gameState.lastAnswer = {
      userAnswer: answer,
      scoreAwarded: score,
      resultType: diff === 0 ? 'CASI_CASI' : (diff <= 10 ? 'CASI' : 'LEJOS'),
      timeUsed: 10, // Simulado
      timeBonus: 0, // Simulado
    };

    io.to(roomId).emit('game-state-updated', gameState);
  });

  // Evento para avanzar al siguiente estado (ej. después de ver el resultado)
  socket.on('next-state', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.gameState) return;

    const { gameState } = room;
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

    // Si volvemos al primer jugador, es una nueva ronda
    if (nextPlayerIndex === 0) {
      gameState.round++;
    }

    // FIN DEL JUEGO (simplificado)
    if (gameState.round > gameState.numberOfRounds) {
      gameState.screen = 'game_over'; // El cliente debería manejar esto
      io.to(roomId).emit('game-state-updated', gameState);
      return;
    }

    gameState.currentPlayerIndex = nextPlayerIndex;
    gameState.question = getNewQuestion(gameState.usedQuestions);
    gameState.usedQuestions.push(gameState.question.id);
    gameState.screen = 'playing'; // Se podría intercalar 'turn_switching'
    
    io.to(roomId).emit('game-state-updated', gameState);
  });

  // Manejo de desconexión
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    // Encontrar la sala donde estaba el jugador y notificar al otro
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomId).emit('player-left', { players: room.players });
        // Si la sala queda vacía, se puede eliminar
        if (room.players.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor Socket.IO escuchando en el puerto ${PORT}`);
});
