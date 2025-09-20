import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <div className="question-card">
      <div className="question-card-category">
        {question.categoria}
      </div>
      <div className="question-card-text">
        <p>{question.pregunta}</p>
      </div>
    </div>
  );
};

export default QuestionCard;