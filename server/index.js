const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const fs = require('fs');

console.log(`\n--- Servidor Iniciado en ${new Date().toISOString()} ---`);

const ROOMS_FILE = path.join(__dirname, 'rooms.json');

// --- Funciones de Utilidad ---
const readRoomsFromFile = () => {
  try {
    if (fs.existsSync(ROOMS_FILE)) {
      const data = fs.readFileSync(ROOMS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error al leer rooms.json:", error);
  }
  return {};
};

const writeRoomsToFile = (rooms) => {
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
  } catch (error) {
    console.error("Error al escribir en rooms.json:", error);
  }
};

// --- Inicialización ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
const PORT = process.env.PORT || 3002;

let rooms = readRoomsFromFile();
let allQuestions = [];

try {
  const questionsData = fs.readFileSync(path.join(__dirname, '../public/questions.json'), 'utf8');
  allQuestions = JSON.parse(questionsData);
  console.log(`Se cargaron ${allQuestions.length} preguntas.`);
} catch (error) {
  console.error('Error al cargar las preguntas:', error);
  process.exit(1);
}

// Servir la aplicación de React
app.use(express.static(path.join(__dirname, '../build')));

// --- Lógica de Juego ---
const getNewQuestion = (excludeIds = []) => {
  const availableQuestions = allQuestions.filter(q => !excludeIds.includes(q.id));
  if (availableQuestions.length === 0) return null;
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};

const createInitialGameState = (players, gameConfig) => {
  const firstQuestion = getNewQuestion();
  return {
    screen: 'playing',
    question: firstQuestion,
    players,
    currentPlayerIndex: 0,
    round: 1,
    numberOfRounds: gameConfig.rounds || 5,
    gameMode: gameConfig.mode || 'classic',
    classicTimer: 30,
    usedQuestions: [firstQuestion.id],
  };
};

// --- Eventos de Socket.IO ---
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  socket.on('create-room', ({ playerName, gameConfig }, callback) => {
    console.log(`[SERVER] Recibido 'create-room' de ${playerName}`);
    const roomId = Math.random().toString(36).substring(2, 7);
    rooms[roomId] = {
      players: [{ id: socket.id, name: playerName, isHost: true, score: 0 }],
      gameState: null,
      gameConfig: gameConfig,
      status: 'waiting_for_guest_name', // Nuevo estado de la sala
    };
    socket.join(roomId);
    console.log(`[SERVER] Jugador ${playerName} (${socket.id}) creó y se unió a la sala ${roomId}`);
    writeRoomsToFile(rooms);
    callback({ roomId });
  });

  // Nuevo evento: Verificar estado de la sala
  socket.on('check-room-status', ({ roomId }, callback) => {
    const room = rooms[roomId];
    if (room && room.status === 'waiting_for_guest_name' && room.players.length === 1) {
      callback({ status: 'ready_to_join', hostName: room.players[0].name });
    } else if (room && room.players.length === 2) {
      callback({ status: 'game_started' }); // O ya está llena
    } else {
      callback({ status: 'not_found' });
    }
  });

  socket.on('join-room', ({ roomId, playerName }, callback) => {
    console.log(`[SERVER] Recibido 'join-room' de ${playerName} para sala ${roomId}`);
    const room = rooms[roomId];
    if (room && room.players.length < 2) {
      room.players.push({ id: socket.id, name: playerName, isHost: false, score: 0 });
      socket.join(roomId);
      console.log(`[SERVER] Jugador ${playerName} se unió. Total jugadores: ${room.players.length}`);
      
      io.to(roomId).emit('player-joined', room.players);
      console.log(`[SERVER] Enviando callback de éxito a ${playerName}`);
      writeRoomsToFile(rooms);
      callback({ success: true, players: room.players });

      // Ya no iniciamos el juego aquí. Esperamos la señal explícita del host.
      // console.log(`[SERVER] INICIANDO JUEGO para sala ${roomId}`);
      // room.gameState = createInitialGameState(room.players, room.gameConfig);
      // io.to(roomId).emit('game-state-updated', room.gameState);

    } else {
      console.log(`[SERVER] Falló join-room para ${playerName}. Sala no encontrada o llena.`);
      callback({ success: false, message: 'La sala no existe o está llena.' });
    }
  });

  // Nuevo evento: Host inicia la partida explícitamente
  socket.on('start-game-explicit', ({ roomId }) => {
    console.log(`[SERVER] Recibido 'start-game-explicit' de ${socket.id} para sala ${roomId}`);
    const room = rooms[roomId];
    if (room && room.players.length === 2 && room.players.find(p => p.id === socket.id)?.isHost) {
      console.log(`[SERVER] INICIANDO JUEGO para sala ${roomId} por petición del host.`);
      room.gameState = createInitialGameState(room.players, room.gameConfig);
      io.to(roomId).emit('game-state-updated', room.gameState);
    } else {
      console.log(`[SERVER] Falló start-game-explicit. Sala no válida o no es el host.`);
    }
  });

  socket.on('submit-answer', ({ roomId, answer }) => {
    const room = rooms[roomId];
    if (!room || !room.gameState) return;
    const { gameState } = room;
    const correctAnswer = gameState.question.respuesta;
    const diff = Math.abs(correctAnswer - parseInt(answer, 10));
    let score = 0;
    if (diff === 0) score = 100; else if (diff <= 5) score = 50; else if (diff <= 10) score = 25;
    gameState.players[gameState.currentPlayerIndex].score += score;
    gameState.screen = 'answer_result';
    gameState.lastAnswer = { userAnswer: answer, scoreAwarded: score, resultType: diff === 0 ? 'CASI_CASI' : (diff <= 10 ? 'CASI' : 'LEJOS'), timeUsed: 10, timeBonus: 0 };
    io.to(roomId).emit('game-state-updated', gameState);
  });

  socket.on('next-state', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.gameState) return;
    const { gameState } = room;
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    if (nextPlayerIndex === 0) gameState.round++;
    if (gameState.round > gameState.numberOfRounds) {
      gameState.screen = 'game_over';
      io.to(roomId).emit('game-state-updated', gameState);
      return;
    }
    gameState.currentPlayerIndex = nextPlayerIndex;
    const newQuestion = getNewQuestion(gameState.usedQuestions);
    if(newQuestion) {
        gameState.question = newQuestion;
        gameState.usedQuestions.push(gameState.question.id);
    }
    gameState.screen = 'playing';
    io.to(roomId).emit('game-state-updated', gameState);
  });

  socket.on('disconnect', () => {
    console.log(`[SERVER-DEBUG] Usuario desconectado: ${socket.id}. La lógica de borrado de sala está DESACTIVADA temporalmente.`);
    // --- LÓGICA DE BORRADO DESACTIVADA PARA DEPURACIÓN ---
    /*
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit('player-left', { players: room.players });
        }
        writeRoomsToFile(rooms);
        break;
      }
    }
    */
  });
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO escuchando en el puerto ${PORT}`);
});