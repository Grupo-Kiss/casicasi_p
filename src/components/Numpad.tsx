import React from 'react';
import '../styles/Numpad.css';

interface NumpadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  timer: number;
  maxTime: number; // New prop for max time
}

const Numpad: React.FC<NumpadProps> = ({ onDigit, onDelete, onSubmit, timer, maxTime }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const timerPercentage = (timer / maxTime) * 100; // Use maxTime for calculation

  return (
    <div className="numpad">
      {digits.map((digit) => (
        <button key={digit} onClick={() => onDigit(digit)}>
          {digit}
        </button>
      ))}
      <button className="delete-btn" onClick={onDelete}>&larr;</button>
      <button onClick={() => onDigit('0')}>0</button>
      <button
        className="ok-btn"
        onClick={onSubmit}
        style={{
          background: `linear-gradient(to top, var(--primary-color) ${timerPercentage}%, #e0e2e5 ${timerPercentage}%)`
        }}
      >
        {timer > 0 ? timer : 'OK'}
      </button>
    </div>
  );
};

export default Numpad;