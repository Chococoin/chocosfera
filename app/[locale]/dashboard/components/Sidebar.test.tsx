import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('renders brand name when not collapsed', () => {
    render(<Sidebar />);
    expect(screen.getByText('Chocósfera')).toBeInTheDocument();
  });

  it('renders chocolate emoji', () => {
    render(<Sidebar />);
    expect(screen.getByText('🍫')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('dashboard.sidebar.dashboard')).toBeInTheDocument();
    expect(screen.getByText('dashboard.sidebar.myTrees')).toBeInTheDocument();
    expect(screen.getByText('dashboard.sidebar.traceability')).toBeInTheDocument();
    expect(screen.getByText('dashboard.sidebar.impact')).toBeInTheDocument();
    expect(screen.getByText('dashboard.sidebar.community')).toBeInTheDocument();
    expect(screen.getByText('dashboard.sidebar.marketplace')).toBeInTheDocument();
    expect(screen.getByText('dashboard.sidebar.settings')).toBeInTheDocument();
  });

  it('renders navigation icons', () => {
    const { container } = render(<Sidebar />);
    const content = container.textContent;
    expect(content).toContain('📊');
    expect(content).toContain('🌳');
    expect(content).toContain('🔍');
    expect(content).toContain('🌍');
    expect(content).toContain('🗨️');
    expect(content).toContain('🛒');
    expect(content).toContain('⚙️');
  });

  it('toggles sidebar collapse on button click', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    // Initially expanded
    expect(screen.getByText('Chocósfera')).toBeInTheDocument();

    // Click collapse button
    const collapseButton = screen.getByLabelText('Collapse sidebar');
    await user.click(collapseButton);

    // Should be collapsed now
    expect(screen.queryByText('Chocósfera')).not.toBeInTheDocument();
  });

  it('shows expand icon when collapsed', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    await user.click(collapseButton);

    expect(screen.getByText('☰')).toBeInTheDocument();
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
  });

  it('shows collapse icon when expanded', () => {
    render(<Sidebar />);
    expect(screen.getByText('✕')).toBeInTheDocument();
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
  });

  it('hides quote when collapsed', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    // Quote should be visible initially
    expect(screen.getByText(/dashboard.sidebar.quote/)).toBeInTheDocument();

    // Collapse sidebar
    const collapseButton = screen.getByLabelText('Collapse sidebar');
    await user.click(collapseButton);

    // Quote should be hidden
    expect(screen.queryByText(/dashboard.sidebar.quote/)).not.toBeInTheDocument();
  });

  it('renders all navigation links with correct hrefs', () => {
    render(<Sidebar />);

    const dashboardLink = screen.getByText('dashboard.sidebar.dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/es/dashboard');

    const treesLink = screen.getByText('dashboard.sidebar.myTrees').closest('a');
    expect(treesLink).toHaveAttribute('href', '/es/dashboard/trees');

    const traceabilityLink = screen.getByText('dashboard.sidebar.traceability').closest('a');
    expect(traceabilityLink).toHaveAttribute('href', '/es/dashboard/traceability');

    const impactLink = screen.getByText('dashboard.sidebar.impact').closest('a');
    expect(impactLink).toHaveAttribute('href', '/es/dashboard/impact');

    const communityLink = screen.getByText('dashboard.sidebar.community').closest('a');
    expect(communityLink).toHaveAttribute('href', '/es/dashboard/community');

    const marketplaceLink = screen.getByText('dashboard.sidebar.marketplace').closest('a');
    expect(marketplaceLink).toHaveAttribute('href', '/es/dashboard/marketplace');

    const settingsLink = screen.getByText('dashboard.sidebar.settings').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/es/dashboard/settings');
  });

  it('applies correct width when expanded', () => {
    const { container } = render(<Sidebar />);
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar.className).toContain('w-64');
  });

  it('applies correct width when collapsed', async () => {
    const user = userEvent.setup();
    const { container } = render(<Sidebar />);

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    await user.click(collapseButton);

    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar.className).toContain('w-16');
  });

  it('renders as a div element', () => {
    const { container } = render(<Sidebar />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('has border styling', () => {
    const { container } = render(<Sidebar />);
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar.className).toContain('border-r');
    expect(sidebar.className).toContain('border-gray-200');
  });

  it('has proper semantic structure with nav element', () => {
    const { container } = render(<Sidebar />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('renders navigation as an unordered list', () => {
    const { container } = render(<Sidebar />);
    expect(container.querySelector('nav ul')).toBeInTheDocument();
  });
});
