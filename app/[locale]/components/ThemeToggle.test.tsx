import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear localStorage and reset DOM classes before each test
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders toggle button', async () => {
    render(<ThemeToggle />);
    await waitFor(() => {
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });
  });

  it('shows moon icon in light mode initially', async () => {
    render(<ThemeToggle />);
    await waitFor(() => {
      const button = screen.getByLabelText('Toggle theme');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('toggles theme on click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Toggle theme');
    await user.click(button);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.body.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  it('toggles back to light mode', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    const button = screen.getByLabelText('Toggle theme');

    // Toggle to dark
    await user.click(button);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    // Toggle back to light
    await user.click(button);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.body.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  it('loads saved theme from localStorage', async () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.body.classList.contains('dark')).toBe(true);
    });
  });

  it('respects system preference when no saved theme', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('shows placeholder button before mounting', () => {
    const { container } = render(<ThemeToggle />);
    const placeholderButton = container.querySelector('[aria-hidden="true"]');
    expect(placeholderButton).toBeInTheDocument();
  });

  it('has correct aria-label', async () => {
    render(<ThemeToggle />);
    await waitFor(() => {
      const button = screen.getByLabelText('Toggle theme');
      expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    });
  });
});
