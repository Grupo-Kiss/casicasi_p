
import React from 'react';
import { Question } from '../types';

interface AnswerResultProps {
  question: Question;
  userAnswer: string;
  scoreAwarded: number;
}

const AnswerResult: React.FC<AnswerResultProps> = ({ question, userAnswer, scoreAwarded }) => {
  const getScoreClass = () => {
    if (scoreAwarded > 20) return 'text-success fw-bold'; // Exact
    if (scoreAwarded > 10) return 'text-success'; // Very Close
    if (scoreAwarded > 0) return 'text-warning'; // In range
    return 'text-danger'; // Incorrect
  };

  return (
    <div className="card text-center my-6 fade-in">
      
      <div className="card-body">
        <p>Tu respuesta: {userAnswer || 'No respondido'}</p>
        <h1 className="card-title">RESPUESTA CORRECTA: {question.respuesta}</h1>
        <h3 className={getScoreClass()}>Sumás {scoreAwarded}</h3>
        <hr />
        <p className="card-text"><em>{question.informacion}</em></p>
        <p className="card-fuente">Fuente: <em>{question.fuente}</em></p>
      </div>
      <div className="card-footer text-muted" style={{ backgroundColor: '#c9caccff' }}>
    Cargando siguiente pregunta...
</div>
    </div>
  );
};

export default AnswerResult;
