import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommunityPage from './page';

// Mock TelegramWidget
vi.mock('../components/TelegramWidget', () => ({
  TelegramWidget: ({ channelUsername, height }: { channelUsername: string; height: number }) => (
    <div data-testid="telegram-widget">
      Telegram Widget for {channelUsername} (height: {height})
    </div>
  ),
}));

describe('CommunityPage', () => {
  it('renders page title', () => {
    render(<CommunityPage />);
    expect(screen.getByText('dashboard.community.title')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<CommunityPage />);
    expect(screen.getByText('dashboard.community.description')).toBeInTheDocument();
  });

  it('renders all three feature cards', () => {
    render(<CommunityPage />);
    expect(screen.getByText('dashboard.community.features.bot.title')).toBeInTheDocument();
    expect(screen.getByText('dashboard.community.features.farmers.title')).toBeInTheDocument();
    expect(screen.getByText('dashboard.community.features.community.title')).toBeInTheDocument();
  });

  it('renders feature card descriptions', () => {
    render(<CommunityPage />);
    expect(screen.getByText('dashboard.community.features.bot.description')).toBeInTheDocument();
    expect(screen.getByText('dashboard.community.features.farmers.description')).toBeInTheDocument();
    expect(screen.getByText('dashboard.community.features.community.description')).toBeInTheDocument();
  });

  it('renders chat section title and description', () => {
    render(<CommunityPage />);
    expect(screen.getByText('dashboard.community.chatTitle')).toBeInTheDocument();
    expect(screen.getByText('dashboard.community.chatDescription')).toBeInTheDocument();
  });

  it('shows configuration warning when TELEGRAM_CHANNEL is not set', () => {
    render(<CommunityPage />);
    expect(screen.getByText('Configuración Requerida')).toBeInTheDocument();
    expect(screen.getByText('Para ver el chat de Telegram aquí, necesitas:')).toBeInTheDocument();
  });

  it('shows configuration steps', () => {
    render(<CommunityPage />);
    expect(screen.getByText('Crear un grupo o canal público en Telegram')).toBeInTheDocument();
    expect(screen.getByText(/Obtener el username/)).toBeInTheDocument();
    expect(screen.getByText(/Actualizar la constante/)).toBeInTheDocument();
  });

  it('renders guidelines section', () => {
    render(<CommunityPage />);
    expect(screen.getByText('dashboard.community.guidelines.title')).toBeInTheDocument();
  });

  it('renders all guideline rules', () => {
    render(<CommunityPage />);
    expect(screen.getByText('dashboard.community.guidelines.rule1')).toBeInTheDocument();
    expect(screen.getByText('dashboard.community.guidelines.rule2')).toBeInTheDocument();
    expect(screen.getByText('dashboard.community.guidelines.rule3')).toBeInTheDocument();
    expect(screen.getByText('dashboard.community.guidelines.rule4')).toBeInTheDocument();
  });

  it('displays feature card icons', () => {
    const { container } = render(<CommunityPage />);
    const content = container.textContent;
    expect(content).toContain('🤖');
    expect(content).toContain('👨‍🌾');
    expect(content).toContain('🌍');
  });

  it('displays header emojis', () => {
    const { container } = render(<CommunityPage />);
    const content = container.textContent;
    expect(content).toContain('🗨️');
    expect(content).toContain('💬');
  });

  it('displays guideline checkmarks and X marks', () => {
    const { container } = render(<CommunityPage />);
    const content = container.textContent;
    expect(content).toContain('✅');
    expect(content).toContain('❌');
  });

  it('warning box has correct styling classes', () => {
    render(<CommunityPage />);
    const warningBox = screen.getByText('Configuración Requerida').closest('div');
    expect(warningBox).toHaveClass('bg-yellow-50', 'dark:bg-yellow-900/20');
  });

  it('does not show join button when channel is not configured', () => {
    render(<CommunityPage />);
    expect(screen.queryByText('dashboard.community.joinButton')).not.toBeInTheDocument();
  });

  it('code snippets are displayed in configuration instructions', () => {
    render(<CommunityPage />);
    expect(screen.getByText('TELEGRAM_CHANNEL')).toBeInTheDocument();
    expect(screen.getByText('dashboard/community/page.tsx')).toBeInTheDocument();
  });
});
