import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';

describe('Hero', () => {
  it('renders the hero title', () => {
    render(<Hero />);
    expect(screen.getByText('hero.title')).toBeInTheDocument();
  });

  it('renders the hero description', () => {
    render(<Hero />);
    expect(screen.getByText('hero.description')).toBeInTheDocument();
  });

  it('renders the eyebrow with brand name', () => {
    render(<Hero />);
    expect(screen.getByText('Chocósfera')).toBeInTheDocument();
  });

  it('renders primary CTA button', () => {
    render(<Hero />);
    expect(screen.getByText('cta.start')).toBeInTheDocument();
  });

  it('renders secondary CTA button for blockchain', () => {
    render(<Hero />);
    expect(screen.getByText('sections.blockchain.title')).toBeInTheDocument();
  });

  it('renders login link for mobile', () => {
    render(<Hero />);
    expect(screen.getByText('register.hasAccount')).toBeInTheDocument();
    expect(screen.getByText('register.loginLink')).toBeInTheDocument();
  });

  it('renders three feature panels', () => {
    render(<Hero />);
    expect(screen.getByText('sections.cacao.title')).toBeInTheDocument();
    expect(screen.getByText('sections.blockchain.title')).toBeInTheDocument();
    expect(screen.getByText('sections.justice.title')).toBeInTheDocument();
  });

  it('displays "100% Fair" text', () => {
    render(<Hero />);
    expect(screen.getByText('100% Fair')).toBeInTheDocument();
  });

  it('displays "Traceable" text', () => {
    render(<Hero />);
    expect(screen.getByText('Traceable')).toBeInTheDocument();
  });

  it('displays "Impacto" text', () => {
    render(<Hero />);
    expect(screen.getByText('Impacto')).toBeInTheDocument();
  });

  it('renders stats section with metrics', () => {
    render(<Hero />);
    expect(screen.getByText('dashboard.main.stats.adoptedTrees')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.stats.communitiesHelped')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.stats.thisMonth')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    render(<Hero />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders "Road to Impact" section', () => {
    render(<Hero />);
    expect(screen.getByText('Road to Impact')).toBeInTheDocument();
  });

  it('renders impact summary items', () => {
    render(<Hero />);
    expect(screen.getByText(/dashboard.main.impactSummary.treesGrowing/)).toBeInTheDocument();
    expect(screen.getByText(/dashboard.main.impactSummary.farmersSupported/)).toBeInTheDocument();
    expect(screen.getByText(/dashboard.main.impactSummary.sustainablePractices/)).toBeInTheDocument();
  });

  it('renders the hero image', () => {
    render(<Hero />);
    const image = screen.getByAltText('Cacao farmers working together');
    expect(image).toBeInTheDocument();
  });

  it('has correct link href for register button', () => {
    render(<Hero />);
    const registerLink = screen.getByText('cta.start').closest('a');
    expect(registerLink).toHaveAttribute('href', '/es/register');
  });

  it('has correct link href for mobile login', () => {
    render(<Hero />);
    const loginLink = screen.getByText('register.loginLink').closest('a');
    expect(loginLink).toHaveAttribute('href', '/es/login');
  });

  it('renders progress bar', () => {
    render(<Hero />);
    expect(screen.getByText('2025 Q1')).toBeInTheDocument();
  });
});
