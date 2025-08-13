import React from 'react';

interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  const progress = (timeLeft / 30) * 100;
  const progressBarColor = timeLeft > 10 ? 'bg-success' : timeLeft > 5 ? 'bg-warning' : 'bg-danger';

  return (
    <div className="d-flex align-items-center mb-3">
      <strong className="me-3">{ timeLeft }</strong>
      <div className="progress flex-grow-1" style={{ height: '25px' }}>
        <div
          className={`progress-bar ${progressBarColor}`}
          role="progressbar"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress} // Cambiado a progress
          aria-valuemin={0}
          aria-valuemax={30}
        />
      </div>
    </div>
  );
};

export default Timer;
