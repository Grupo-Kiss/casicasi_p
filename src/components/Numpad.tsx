
import React from 'react';

interface NumpadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
}

const Numpad: React.FC<NumpadProps> = ({ onDigit, onDelete, onSubmit }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="numpad mt-3 mx-auto" style={{ maxWidth: '200px' }}>
      <div className="row g-2">
        {digits.map((digit) => (
          <div className="col-4" key={digit}>
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => onDigit(digit)}
            >
              {digit}
            </button>
          </div>
        ))}
        <div className="col-4">
          <button className="btn btn-outline-danger w-100" onClick={onDelete}>
            &larr;
          </button>
        </div>
        <div className="col-4">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => onDigit('0')}
          >
            0
          </button>
        </div>
        <div className="col-4">
          <button className="btn btn-success w-100" onClick={onSubmit}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Numpad;
