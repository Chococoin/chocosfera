import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreesPage from './page';

describe('TreesPage', () => {
  it('renders page title', () => {
    render(<TreesPage />);
    expect(screen.getByText('dashboard.trees.title')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<TreesPage />);
    expect(screen.getByText('dashboard.trees.description')).toBeInTheDocument();
  });

  it('renders all stats cards', () => {
    render(<TreesPage />);
    expect(screen.getByText('dashboard.trees.stats.totalTrees')).toBeInTheDocument();
    expect(screen.getByText('dashboard.trees.stats.totalProduction')).toBeInTheDocument();
    expect(screen.getByText('dashboard.trees.stats.co2Offset')).toBeInTheDocument();
    expect(screen.getByText('dashboard.trees.stats.farmersSupported')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    render(<TreesPage />);
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('178 kg')).toBeInTheDocument();
    expect(screen.getByText('2.4 ton')).toBeInTheDocument();
  });

  it('renders all 6 tree cards', () => {
    render(<TreesPage />);
    expect(screen.getByText('Cacao #001')).toBeInTheDocument();
    expect(screen.getByText('Cacao #002')).toBeInTheDocument();
    expect(screen.getByText('Cacao #003')).toBeInTheDocument();
    expect(screen.getByText('Cacao #004')).toBeInTheDocument();
    expect(screen.getByText('Cacao #005')).toBeInTheDocument();
    expect(screen.getByText('Cacao #006')).toBeInTheDocument();
  });

  it('displays tree locations', () => {
    render(<TreesPage />);
    expect(screen.getByText('Valle del Cauca, Colombia')).toBeInTheDocument();
    expect(screen.getByText('Cusco, Perú')).toBeInTheDocument();
    expect(screen.getByText('Tabasco, México')).toBeInTheDocument();
    expect(screen.getByText('Kilimanjaro, Tanzania')).toBeInTheDocument();
    expect(screen.getByText('Barlovento, Venezuela')).toBeInTheDocument();
    expect(screen.getByText('Esmeraldas, Ecuador')).toBeInTheDocument();
  });

  it('displays farmer names', () => {
    render(<TreesPage />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María González')).toBeInTheDocument();
    expect(screen.getByText('Carlos Ramírez')).toBeInTheDocument();
    expect(screen.getByText('Amani Mkali')).toBeInTheDocument();
    expect(screen.getByText('Rosa Medina')).toBeInTheDocument();
    expect(screen.getByText('Pedro Quiñónez')).toBeInTheDocument();
  });

  it('displays tree ages', () => {
    render(<TreesPage />);
    expect(screen.getByText('2 años')).toBeInTheDocument();
    expect(screen.getByText('1.5 años')).toBeInTheDocument();
    expect(screen.getByText('8 meses')).toBeInTheDocument();
    expect(screen.getByText('3 años')).toBeInTheDocument();
    expect(screen.getByText('1 año')).toBeInTheDocument();
    expect(screen.getByText('10 meses')).toBeInTheDocument();
  });

  it('displays production amounts', () => {
    render(<TreesPage />);
    expect(screen.getByText('45 kg')).toBeInTheDocument();
    expect(screen.getByText('32 kg')).toBeInTheDocument();
    expect(screen.getByText('0 kg')).toBeInTheDocument();
    expect(screen.getByText('58 kg')).toBeInTheDocument();
    expect(screen.getByText('28 kg')).toBeInTheDocument();
    expect(screen.getByText('15 kg')).toBeInTheDocument();
  });

  it('displays tree status badges', () => {
    render(<TreesPage />);
    expect(screen.getByText('dashboard.trees.status.healthy')).toBeInTheDocument();
    expect(screen.getByText('dashboard.trees.status.growing')).toBeInTheDocument();
    expect(screen.getByText('dashboard.trees.status.young')).toBeInTheDocument();
  });

  it('renders view details buttons', () => {
    render(<TreesPage />);
    const viewDetailsButtons = screen.getAllByText('dashboard.trees.treeCard.viewDetails');
    expect(viewDetailsButtons).toHaveLength(6);
  });

  it('renders what3words addresses', () => {
    render(<TreesPage />);
    expect(screen.getByText('árbol.chocolate.dulce')).toBeInTheDocument();
    expect(screen.getByText('montaña.cacao.sembrado')).toBeInTheDocument();
    expect(screen.getByText('verde.tierra.fresco')).toBeInTheDocument();
    expect(screen.getByText('mti.kahawa.tamu')).toBeInTheDocument();
    expect(screen.getByText('brotes.selva.cosecha')).toBeInTheDocument();
    expect(screen.getByText('plantación.joven.esperanza')).toBeInTheDocument();
  });

  it('renders adopt new tree CTA section', () => {
    render(<TreesPage />);
    expect(screen.getByText('dashboard.trees.adoptCta.title')).toBeInTheDocument();
    expect(screen.getByText('dashboard.trees.adoptCta.description')).toBeInTheDocument();
    expect(screen.getByText('dashboard.trees.adoptCta.button')).toBeInTheDocument();
  });

  it('displays tree emojis', () => {
    const { container } = render(<TreesPage />);
    const content = container.textContent;
    expect(content).toContain('🌳');
    expect(content).toContain('🌱');
    expect(content).toContain('🌿');
  });

  it('displays labels for tree details', () => {
    render(<TreesPage />);
    const ageLabels = screen.getAllByText('dashboard.trees.treeCard.age');
    expect(ageLabels.length).toBeGreaterThan(0);

    const productionLabels = screen.getAllByText('dashboard.trees.treeCard.production');
    expect(productionLabels.length).toBeGreaterThan(0);

    const farmerLabels = screen.getAllByText('dashboard.trees.treeCard.farmer');
    expect(farmerLabels.length).toBeGreaterThan(0);

    const adoptedLabels = screen.getAllByText('dashboard.trees.treeCard.adopted');
    expect(adoptedLabels.length).toBeGreaterThan(0);
  });

  it('renders location pin buttons', () => {
    render(<TreesPage />);
    const pinButtons = screen.getAllByText('📍');
    expect(pinButtons.length).toBeGreaterThan(0);
  });
});
