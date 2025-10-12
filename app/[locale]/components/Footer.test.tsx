import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the brand name', () => {
    render(<Footer />);
    expect(screen.getByText('Chocósfera')).toBeInTheDocument();
  });

  it('renders the about section', () => {
    render(<Footer />);
    expect(screen.getByText('footer.about')).toBeInTheDocument();
  });

  it('renders footer links section', () => {
    render(<Footer />);
    expect(screen.getByText('footer.links')).toBeInTheDocument();
    expect(screen.getByText('footer.aboutUs')).toBeInTheDocument();
    expect(screen.getByText('footer.howItWorks')).toBeInTheDocument();
    expect(screen.getByText('footer.faqs')).toBeInTheDocument();
    expect(screen.getByText('footer.contact')).toBeInTheDocument();
  });

  it('renders social media section', () => {
    render(<Footer />);
    expect(screen.getByText('footer.followUs')).toBeInTheDocument();
  });

  it('renders all 6 social media links', () => {
    render(<Footer />);
    expect(screen.getByLabelText('YouTube')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('TikTok')).toBeInTheDocument();
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter/X')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('has correct social media links', () => {
    render(<Footer />);
    expect(screen.getByLabelText('YouTube')).toHaveAttribute('href', 'https://youtube.com/@chocosfera');
    expect(screen.getByLabelText('Instagram')).toHaveAttribute('href', 'https://instagram.com/chocosfera');
    expect(screen.getByLabelText('TikTok')).toHaveAttribute('href', 'https://tiktok.com/@chocosfera');
    expect(screen.getByLabelText('Facebook')).toHaveAttribute('href', 'https://facebook.com/chocosfera');
    expect(screen.getByLabelText('Twitter/X')).toHaveAttribute('href', 'https://twitter.com/chocosfera');
    expect(screen.getByLabelText('LinkedIn')).toHaveAttribute('href', 'https://linkedin.com/company/chocosfera');
  });

  it('renders copyright text with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} Chocósfera`))).toBeInTheDocument();
  });

  it('renders rights reserved text', () => {
    render(<Footer />);
    expect(screen.getByText('footer.rights')).toBeInTheDocument();
  });

  it('renders made with text', () => {
    render(<Footer />);
    expect(screen.getByText('footer.madeWith')).toBeInTheDocument();
  });

  it('all social links open in new tab', () => {
    render(<Footer />);
    const socialLinks = [
      screen.getByLabelText('YouTube'),
      screen.getByLabelText('Instagram'),
      screen.getByLabelText('TikTok'),
      screen.getByLabelText('Facebook'),
      screen.getByLabelText('Twitter/X'),
      screen.getByLabelText('LinkedIn'),
    ];

    socialLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
