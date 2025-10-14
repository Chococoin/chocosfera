import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './page';

describe('DashboardPage', () => {
  it('renders welcome message', () => {
    render(<DashboardPage />);
    expect(screen.getByText('dashboard.main.welcome')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.welcomeMessage')).toBeInTheDocument();
  });

  it('renders all stats cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('dashboard.main.stats.adoptedTrees')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.stats.cocoaProduced')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.stats.carbonOffset')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.stats.communitiesHelped')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    render(<DashboardPage />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('248 kg')).toBeInTheDocument();
    expect(screen.getByText('1.2 ton')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays percentage changes for stats', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/3%/)).toBeInTheDocument();
    expect(screen.getByText(/15%/)).toBeInTheDocument();
    expect(screen.getByText(/8%/)).toBeInTheDocument();
    expect(screen.getByText(/2%/)).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('dashboard.main.recentActivity')).toBeInTheDocument();
  });

  it('displays all recent activities', () => {
    render(<DashboardPage />);
    expect(screen.getByText('dashboard.main.activity.treeAdopted')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.activity.harvestRecorded')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.activity.impactUpdated')).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('dashboard.main.quickActions')).toBeInTheDocument();
  });

  it('displays all quick action buttons', () => {
    render(<DashboardPage />);
    expect(screen.getByText('dashboard.main.actions.adoptTree')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.actions.viewTraceability')).toBeInTheDocument();
    expect(screen.getByText('dashboard.main.actions.seeImpact')).toBeInTheDocument();
  });

  it('renders impact summary section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('dashboard.main.impactSummary.title')).toBeInTheDocument();
  });

  it('displays all impact summary items', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/dashboard.main.impactSummary.treesGrowing/)).toBeInTheDocument();
    expect(screen.getByText(/dashboard.main.impactSummary.farmersSupported/)).toBeInTheDocument();
    expect(screen.getByText(/dashboard.main.impactSummary.sustainablePractices/)).toBeInTheDocument();
  });

  it('quick action buttons are clickable', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    const adoptTreeButton = screen.getByText('dashboard.main.actions.adoptTree');
    expect(adoptTreeButton).toBeInTheDocument();

    await user.click(adoptTreeButton);
  });

  it('displays stat icons', () => {
    render(<DashboardPage />);
    const container = screen.getByText('dashboard.main.stats.adoptedTrees').closest('.bg-white');
    expect(container?.textContent).toContain('🌳');
  });

  it('displays activity icons', () => {
    render(<DashboardPage />);
    const activitySection = screen.getByText('dashboard.main.recentActivity').closest('.bg-white');
    expect(activitySection?.textContent).toContain('🌱');
    expect(activitySection?.textContent).toContain('📦');
    expect(activitySection?.textContent).toContain('📊');
  });

  it('displays "this month" text for stats', () => {
    render(<DashboardPage />);
    const thisMonthTexts = screen.getAllByText('dashboard.main.stats.thisMonth');
    expect(thisMonthTexts).toHaveLength(4);
  });

  it('all stats show increase indicators', () => {
    render(<DashboardPage />);
    const container = screen.getByText('dashboard.main.welcome').closest('div');
    const statsText = container?.parentElement?.textContent || '';
    expect(statsText).toContain('↑');
  });
});
