import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders setup screen', () => {
  render(<App />);
  const linkElement = screen.getByText(/¿Quiénes van a jugar?/i);
  expect(linkElement).toBeInTheDocument();
});
