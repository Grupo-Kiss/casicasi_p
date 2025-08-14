import React from 'react';
import { Player } from '../types';

interface TurnSwitcherProps {
  player: Player;
}

const TurnSwitcher: React.FC<TurnSwitcherProps> = ({ player }) => {
  if (!player) return null;

  return (
    <div className="turn-switcher">
      <img src={player.avatar} alt={player.name} className="avatar" />
      <h1>{player.name}</h1>
      <p>¡Es tu turno!</p>
    </div>
  );
};

export default TurnSwitcher;
