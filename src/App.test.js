import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Fisherman app navigation', async () => {
  render(<App />);
  expect(screen.getByText(/Fisherman's Friend/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Catch logs/i })).toBeInTheDocument();
  expect(await screen.findByText(/Voice-first trip decisions/i)).toBeInTheDocument();
});
