import React from 'react';
import '../styles/Numpad.css';

interface NumpadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
}

const Numpad: React.FC<NumpadProps> = ({ onDigit, onDelete, onSubmit }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

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
        className="submit-btn"
        onClick={onSubmit}
      >
        &#10148;
      </button>
    </div>
  );
};

export default Numpad;