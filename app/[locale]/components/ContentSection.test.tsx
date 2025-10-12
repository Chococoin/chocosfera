import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContentSection from './ContentSection';

describe('ContentSection', () => {
  const mockProps = {
    title: 'Test Title',
    description: 'Test Description',
    imageSrc: '/test-image.jpg',
    imageAlt: 'Test Alt Text',
  };

  it('renders the title', () => {
    render(<ContentSection {...mockProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<ContentSection {...mockProps} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders an image with correct alt text', () => {
    render(<ContentSection {...mockProps} />);
    const image = screen.getByAltText('Test Alt Text');
    expect(image).toBeInTheDocument();
  });

  it('image has correct src attribute', () => {
    render(<ContentSection {...mockProps} />);
    const image = screen.getByAltText('Test Alt Text');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('applies content-card class', () => {
    const { container } = render(<ContentSection {...mockProps} />);
    expect(container.querySelector('.content-card')).toBeInTheDocument();
  });

  it('applies content-card__title class to title', () => {
    const { container } = render(<ContentSection {...mockProps} />);
    expect(container.querySelector('.content-card__title')).toBeInTheDocument();
  });

  it('renders as an article element', () => {
    const { container } = render(<ContentSection {...mockProps} />);
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
