import React from 'react';
import '../styles/TimerBar.css';

interface TimerBarProps {
  timer: number;
  maxTime: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ timer, maxTime }) => {
  const timerPercentage = (timer / maxTime) * 100;

  return (
    <div className="timer-bar-container">
      <div
        className="timer-bar"
        style={{ width: `${timerPercentage}%` }}
      ></div>
    </div>
  );
};

export default TimerBar;