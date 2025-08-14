
import React from 'react';
import '../styles/Numpad.css';

interface NumpadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  timer: number;
}

const Numpad: React.FC<NumpadProps> = ({ onDigit, onDelete, onSubmit, timer }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const timerPercentage = (timer / 30) * 100;

  return (
    <div className="numpad">
      {digits.map((digit) => (
        <button key={digit} onClick={() => onDigit(digit)}>
          {digit}
        </button>
      ))}
      <button className="delete-btn" onClick={onDelete}>&larr;</button>
      <button 
        className="ok-btn"
        onClick={onSubmit}
        style={{ 
          background: `linear-gradient(to top, var(--primary-color) ${timerPercentage}%, #e0e2e5 ${timerPercentage}%)`
        }}
      >
        OK
      </button>
    </div>
  );
};

export default Numpad;
