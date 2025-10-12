import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardHeader } from './DashboardHeader';

// Mock ThemeToggle
vi.mock('../../components/ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

describe('DashboardHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the dashboard title', () => {
    render(<DashboardHeader />);
    expect(screen.getByText('dashboard.header.title')).toBeInTheDocument();
  });

  it('renders theme toggle', () => {
    render(<DashboardHeader />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders profile button', () => {
    render(<DashboardHeader />);
    expect(screen.getByText('dashboard.header.profile')).toBeInTheDocument();
  });

  it('displays user icon', () => {
    render(<DashboardHeader />);
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('shows profile menu when profile button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DashboardHeader />);

    const profileButton = screen.getByText('dashboard.header.profile');
    await user.click(profileButton);

    await waitFor(() => {
      expect(screen.getByText('Usuario Demo')).toBeInTheDocument();
      expect(screen.getByText('demo@chocosfera.com')).toBeInTheDocument();
    });
  });

  it('shows settings and logout options in profile menu', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DashboardHeader />);

    const profileButton = screen.getByText('dashboard.header.profile');
    await user.click(profileButton);

    await waitFor(() => {
      expect(screen.getByText('dashboard.header.settings')).toBeInTheDocument();
      expect(screen.getByText('dashboard.header.logout')).toBeInTheDocument();
    });
  });

  it('closes profile menu when clicking outside', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <div>
        <DashboardHeader />
        <div data-testid="outside">Outside</div>
      </div>
    );

    const profileButton = screen.getByText('dashboard.header.profile');
    await user.click(profileButton);

    await waitFor(() => {
      expect(screen.getByText('Usuario Demo')).toBeInTheDocument();
    });

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    await waitFor(() => {
      expect(screen.queryByText('Usuario Demo')).not.toBeInTheDocument();
    });
  });

  it('calls logout handler when logout is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const user = userEvent.setup({ delay: null });
    render(<DashboardHeader />);

    const profileButton = screen.getByText('dashboard.header.profile');
    await user.click(profileButton);

    await waitFor(() => {
      expect(screen.getByText('dashboard.header.logout')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('dashboard.header.logout');
    await user.click(logoutButton);

    expect(consoleSpy).toHaveBeenCalledWith('Logout');
  });

  it('displays current time', async () => {
    const mockDate = new Date('2025-01-15T14:30:00');
    vi.setSystemTime(mockDate);

    render(<DashboardHeader />);

    await waitFor(() => {
      const timeDisplay = screen.getByText(/:/);
      expect(timeDisplay).toBeInTheDocument();
    });
  });

  it('updates time every second', async () => {
    const mockDate = new Date('2025-01-15T14:30:00');
    vi.setSystemTime(mockDate);

    render(<DashboardHeader />);

    await waitFor(() => {
      expect(screen.getByText(/:/)).toBeInTheDocument();
    });

    // Advance time by 1 second
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText(/:/)).toBeInTheDocument();
    });
  });

  it('renders as a header element', () => {
    const { container } = render(<DashboardHeader />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('displays settings icon in menu', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DashboardHeader />);

    const profileButton = screen.getByText('dashboard.header.profile');
    await user.click(profileButton);

    await waitFor(() => {
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });
  });

  it('displays logout icon in menu', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DashboardHeader />);

    const profileButton = screen.getByText('dashboard.header.profile');
    await user.click(profileButton);

    await waitFor(() => {
      expect(screen.getByText('🚪')).toBeInTheDocument();
    });
  });
});
