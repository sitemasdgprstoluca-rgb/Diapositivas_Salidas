/**
 * Smoke test del dashboard — valida que el stack de Vitest + jsdom + jest-dom
 * está conectado correctamente. Si este pasa, podemos escribir tests reales.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders a React component and finds it via testing-library', () => {
    render(<h1>Hola Supervisión</h1>);
    expect(screen.getByText('Hola Supervisión')).toBeInTheDocument();
  });

  it('jsdom provides document/window globals', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
    expect(document.createElement('div')).toBeTruthy();
  });
});
