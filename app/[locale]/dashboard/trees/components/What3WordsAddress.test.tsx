import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { What3WordsAddress } from './What3WordsAddress';

describe('What3WordsAddress', () => {
  const mockProps = {
    address: 'árbol.chocolate.dulce',
    languageName: 'Español',
  };

  beforeEach(() => {
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    // Mock window.open
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('renders what3words title', () => {
    render(<What3WordsAddress {...mockProps} />);
    expect(screen.getByText('dashboard.trees.what3words.title')).toBeInTheDocument();
  });

  it('renders the address with three slashes', () => {
    render(<What3WordsAddress {...mockProps} />);
    expect(screen.getByText('///')).toBeInTheDocument();
    expect(screen.getByText('árbol.chocolate.dulce')).toBeInTheDocument();
  });

  it('displays the language name', () => {
    render(<What3WordsAddress {...mockProps} />);
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  it('shows local language badge', () => {
    render(<What3WordsAddress {...mockProps} />);
    expect(screen.getByText('dashboard.trees.what3words.localLanguage')).toBeInTheDocument();
  });

  it('renders explanation text', () => {
    render(<What3WordsAddress {...mockProps} />);
    expect(screen.getByText('dashboard.trees.what3words.explanation')).toBeInTheDocument();
  });

  it('copies address to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    render(<What3WordsAddress {...mockProps} />);

    const copyButton = screen.getByTitle('dashboard.trees.what3words.copyAddress');
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('///árbol.chocolate.dulce');
  });

  it('shows checkmark after copying', async () => {
    const user = userEvent.setup();
    render(<What3WordsAddress {...mockProps} />);

    const copyButton = screen.getByTitle('dashboard.trees.what3words.copyAddress');
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });

  it('checkmark disappears after 2 seconds', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<What3WordsAddress {...mockProps} />);

    const copyButton = screen.getByTitle('dashboard.trees.what3words.copyAddress');
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('opens what3words website when map button is clicked', async () => {
    const user = userEvent.setup();
    render(<What3WordsAddress {...mockProps} />);

    const mapButton = screen.getByTitle('dashboard.trees.what3words.viewOnMap');
    await user.click(mapButton);

    expect(window.open).toHaveBeenCalledWith(
      'https://what3words.com/árbol.chocolate.dulce',
      '_blank'
    );
  });

  it('renders copy button with clipboard icon', () => {
    render(<What3WordsAddress {...mockProps} />);
    const copyButton = screen.getByTitle('dashboard.trees.what3words.copyAddress');
    expect(copyButton.textContent).toContain('📋');
  });

  it('renders map button with map icon', () => {
    render(<What3WordsAddress {...mockProps} />);
    const mapButton = screen.getByTitle('dashboard.trees.what3words.viewOnMap');
    expect(mapButton.textContent).toContain('🗺️');
  });

  it('renders location pin emoji', () => {
    const { container } = render(<What3WordsAddress {...mockProps} />);
    expect(container.textContent).toContain('📍');
  });

  it('handles different language names', () => {
    render(<What3WordsAddress address="mti.kahawa.tamu" languageName="Kiswahili" />);
    expect(screen.getByText('Kiswahili')).toBeInTheDocument();
    expect(screen.getByText('mti.kahawa.tamu')).toBeInTheDocument();
  });

  it('handles different addresses', () => {
    render(<What3WordsAddress address="verde.tierra.fresco" languageName="Español" />);
    expect(screen.getByText('verde.tierra.fresco')).toBeInTheDocument();
  });
});
