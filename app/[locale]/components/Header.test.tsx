import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

// Mock ThemeToggle and LanguageSelector
vi.mock('./ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('./LanguageSelector', () => ({
  default: () => <div data-testid="language-selector">Language Selector</div>,
}));

describe('Header', () => {
  it('renders the brand title', () => {
    render(<Header />);
    expect(screen.getByText('header.title')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('navigation.home')).toBeInTheDocument();
    expect(screen.getByText('navigation.traceability')).toBeInTheDocument();
    expect(screen.getByText('navigation.impact')).toBeInTheDocument();
    expect(screen.getByText('navigation.create')).toBeInTheDocument();
  });

  it('renders login and register buttons', () => {
    render(<Header />);
    expect(screen.getByText('header.login')).toBeInTheDocument();
    expect(screen.getByText('header.register')).toBeInTheDocument();
  });

  it('renders theme toggle and language selector', () => {
    render(<Header />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
  });

  it('has correct navigation href attributes', () => {
    render(<Header />);
    const homeLink = screen.getByText('navigation.home').closest('a');
    expect(homeLink).toHaveAttribute('href', '#home');

    const traceabilityLink = screen.getByText('navigation.traceability').closest('a');
    expect(traceabilityLink).toHaveAttribute('href', '#feature');

    const impactLink = screen.getByText('navigation.impact').closest('a');
    expect(impactLink).toHaveAttribute('href', '#impact');

    const createLink = screen.getByText('navigation.create').closest('a');
    expect(createLink).toHaveAttribute('href', '#cta');
  });

  it('has correct auth button links', () => {
    render(<Header />);
    const loginLink = screen.getByText('header.login').closest('a');
    expect(loginLink).toHaveAttribute('href', '/es/login');

    const registerLink = screen.getByText('header.register').closest('a');
    expect(registerLink).toHaveAttribute('href', '/es/register');
  });

  it('applies correct CSS classes', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('fixed', 'left-0', 'right-0', 'top-0', 'z-50');
  });
});
