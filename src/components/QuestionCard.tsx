import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'historia':
        return 'bg-warning text-dark';
      case 'geografia':
        return 'bg-success text-white';
      case 'cultura':
        return 'bg-info text-dark';
      case 'mix':
        return 'bg-secondary text-white';
      default:
        return 'bg-dark text-white';
    }
  };

  return (
    <div className="card text-center shadow-lg border-0 h-100">
      <div className={`card-header fs-5 fw-bold ${getCategoryStyle(question.categoria)}`}>
        {question.categoria}
      </div>
      <div className="card-body d-flex align-items-center justify-content-center p-0 p-lg-0">
        <p
          className="lead"
          style={{
            fontSize: 'clamp(1rem, 3vw, 2rem)', // Cambia el tamaño aquí
            color: '.categoria', // Cambia el color aquí (por ejemplo, un rojo anaranjado)
            backgroundColor: '#d9d9dfef', // Fondo
            margin: '0 0px', // Margen horizontal
            padding: '30px', // Espacio interno
            borderBottomColor: '.categoria', // Color del borde inferior
            borderBottomWidth: '3px', // Ancho del borde inferior
            borderBottomStyle: 'solid', // Estilo del borde inferior
          }}
        >
          {question.pregunta}
        </p>
      </div>
    </div>
  );
};

export default QuestionCard;
