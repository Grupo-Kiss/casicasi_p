import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { useGameOrchestrator } from './hooks/useGameOrchestrator';

// Mockear el hook useGameOrchestrator para tener control sobre el estado del juego en las pruebas
jest.mock('./hooks/useGameOrchestrator');

// Tipado para el mock de useGameOrchestrator
const mockUseGameOrchestrator = useGameOrchestrator as jest.Mock;

// Objeto base del estado del juego para las pruebas
const baseMockState = {
  players: [{ name: 'Player 1', score: 100, avatar: '', exactHits: 0, correctHits: 0, wrongHits: 0, totalTimeUsed: 0 }],
  numberOfRounds: 5,
  classicTimer: 30,
  currentQuestion: { pregunta: '¿Cuánto es 2+2?', respuesta: 4, rango_min: 3, rango_max: 5, categoria: 'math', activa: 'SI' },
  currentAnswer: '',
  setCurrentAnswer: jest.fn(),
  round: 0,
  currentPlayerIndex: 0,
  isShowingAnswer: false,
  lastRoundScore: null,
  initializeGame: jest.fn(),
  handleAnswer: jest.fn(),
  handleReset: jest.fn(),
  highScore: null,
  plusminusGuessesLeft: 0,
  plusminusHint: null,
  handlePlusminusGuess: jest.fn(),
  plusminusTimer: 10,
};

describe('App', () => {
  // Prueba 1: Renderizado inicial de la pantalla de configuración
  test('debería renderizar la pantalla de configuración inicialmente', () => {
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'setup',
    });
    render(<App />);
    expect(screen.getByText(/¿Quiénes van a jugar?/i)).toBeInTheDocument();
  });

  // Prueba 2: Renderizado de la pantalla de juego cuando el estado es 'playing'
  test('debería renderizar la pantalla de juego cuando gameScreen es "playing"', () => {
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'playing',
    });
    render(<App />);
    expect(screen.getByText(/Ronda 1 de 5/i)).toBeInTheDocument();
    expect(screen.getByText(/¿Cuánto es 2\+2?/i)).toBeInTheDocument();
  });

  // Prueba 3: Renderizado del cambiador de turno
  test('debería renderizar el cambiador de turno cuando gameScreen es "turn_switching"', () => {
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'turn_switching',
    });
    render(<App />);
    expect(screen.getByText(/Turno de Player 1/i)).toBeInTheDocument();
  });

  // Prueba 4: Renderizado del resultado de la respuesta
  test('debería renderizar el resultado de la respuesta cuando isShowingAnswer es true', () => {
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'showing_answer',
      isShowingAnswer: true,
      lastRoundScore: 50,
    });
    render(<App />);
    expect(screen.getByText(/¡Bien Hecho!/i)).toBeInTheDocument();
    expect(screen.getByText(/\+50/i)).toBeInTheDocument();
  });

  // Prueba 5: Renderizado de las estadísticas del juego al finalizar
  test('debería renderizar las estadísticas del juego cuando gameScreen es "gameover"', () => {
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'gameover',
    });
    render(<App />);
    expect(screen.getByText(/Fin del Juego/i)).toBeInTheDocument();
    expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
  });

  // Prueba 6: Simulación de un flujo de juego completo (Integración)
  test('debería manejar un flujo de juego desde el inicio hasta el final', () => {
    // 1. Pantalla de configuración inicial
    const initializeGame = jest.fn();
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'setup',
      initializeGame,
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Empezar Juego/i));
    expect(initializeGame).toHaveBeenCalled();

    // 2. Transición a la pantalla de juego
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'playing',
    });
    render(<App />);
    expect(screen.getByText(/Ronda 1 de 5/i)).toBeInTheDocument();

    // 3. Simular respuesta y envío
    const handleAnswer = jest.fn();
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'playing',
      handleAnswer,
    });
    render(<App />);
    fireEvent.click(screen.getByText(/Enviar/i));
    expect(handleAnswer).toHaveBeenCalled();

    // 4. Transición a la pantalla de resultados
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'showing_answer',
      isShowingAnswer: true,
      lastRoundScore: 100,
    });
    render(<App />);
    expect(screen.getByText(/¡Excelente!/i)).toBeInTheDocument();

    // 5. Transición a la pantalla de fin de juego
    mockUseGameOrchestrator.mockReturnValue({
      ...baseMockState,
      gameScreen: 'gameover',
    });
    render(<App />);
    expect(screen.getByText(/Fin del Juego/i)).toBeInTheDocument();
  });
});