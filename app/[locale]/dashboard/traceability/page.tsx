'use client';

import { useState } from 'react';

interface TraceabilityStep {
  id: number;
  title: string;
  date: string;
  location: string;
  icon: string;
  status: 'completed' | 'in-progress' | 'pending';
  details: string;
}

export default function TraceabilityPage() {
  const [selectedProduct, setSelectedProduct] = useState('product-001');

  const traceabilitySteps: TraceabilityStep[] = [
    {
      id: 1,
      title: 'Plantación',
      date: '15 Ene 2024',
      location: 'Finca El Cacao, Ecuador',
      icon: '🌱',
      status: 'completed',
      details: 'Árbol plantado y registrado en blockchain',
    },
    {
      id: 2,
      title: 'Crecimiento',
      date: '20 Mar 2024',
      location: 'Finca El Cacao, Ecuador',
      icon: '🌳',
      status: 'completed',
      details: 'Árbol en fase de crecimiento, certificado orgánico',
    },
    {
      id: 3,
      title: 'Cosecha',
      date: '10 Oct 2024',
      location: 'Finca El Cacao, Ecuador',
      icon: '🍫',
      status: 'completed',
      details: 'Cosecha verificada: 12kg de cacao',
    },
    {
      id: 4,
      title: 'Procesamiento',
      date: '15 Oct 2024',
      location: 'Centro de Procesamiento, Quito',
      icon: '⚙️',
      status: 'in-progress',
      details: 'Fermentación y secado en proceso',
    },
    {
      id: 5,
      title: 'Distribución',
      date: 'Próximamente',
      location: 'En tránsito',
      icon: '🚚',
      status: 'pending',
      details: 'Esperando procesamiento',
    },
  ];

  const blockchainInfo = {
    transactionHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    blockNumber: '18457234',
    timestamp: '2024-10-10 14:23:15 UTC',
    network: 'Ethereum Mainnet',
  };

  const certifications = [
    { name: 'Fair Trade', icon: '✅', color: 'green' },
    { name: 'Orgánico', icon: '🌿', color: 'emerald' },
    { name: 'Carbono Neutral', icon: '🌍', color: 'blue' },
    { name: 'Rainforest Alliance', icon: '🐸', color: 'teal' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-heading mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Trazabilidad
          </h1>
          <p className="text-muted">
            Sigue el recorrido completo de tu cacao desde el origen hasta ti
          </p>
        </div>
        <div className="surface-panel px-4 py-2">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="bg-transparent text-heading font-medium focus:outline-none cursor-pointer"
          >
            <option value="product-001">Producto #001</option>
            <option value="product-002">Producto #002</option>
            <option value="product-003">Producto #003</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="surface-panel p-6">
            <h2 className="text-xl font-bold text-heading mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Recorrido del Producto
            </h2>
            <div className="space-y-6">
              {traceabilitySteps.map((step, index) => (
                <div key={step.id} className="relative">
                  {index !== traceabilitySteps.length - 1 && (
                    <div
                      className={`absolute left-6 top-14 w-0.5 h-16 ${
                        step.status === 'completed'
                          ? 'bg-gradient-to-b from-green-500 to-green-300'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  )}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        step.status === 'completed'
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg'
                          : step.status === 'in-progress'
                            ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-alt)] shadow-lg animate-pulse'
                            : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-heading">
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted">{step.location}</p>
                        </div>
                        <span className="text-sm text-muted">{step.date}</span>
                      </div>
                      <p className="text-sm text-muted">{step.details}</p>
                      {step.status === 'completed' && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <span>✓</span>
                          <span>Verificado en blockchain</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="surface-panel p-6">
            <h2 className="text-xl font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Verificación Blockchain
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                <span className="text-sm text-muted">Hash de Transacción</span>
                <span className="text-sm text-heading font-mono">
                  {blockchainInfo.transactionHash.slice(0, 20)}...
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                <span className="text-sm text-muted">Bloque</span>
                <span className="text-sm text-heading font-mono">{blockchainInfo.blockNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                <span className="text-sm text-muted">Fecha/Hora</span>
                <span className="text-sm text-heading">{blockchainInfo.timestamp}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted">Red</span>
                <span className="text-sm text-heading">{blockchainInfo.network}</span>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 w-full px-4 py-2 rounded-2xl border border-[var(--color-border)] text-sm font-medium text-heading hover:bg-[rgba(223,134,170,0.08)] transition-all"
            >
              Ver en Explorador de Bloques →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Info */}
          <div className="surface-panel p-6">
            <h3 className="text-lg font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Información del Producto
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted">ID del Árbol</span>
                <p className="text-heading font-semibold">#TREE-2024-001</p>
              </div>
              <div>
                <span className="text-muted">Variedad</span>
                <p className="text-heading font-semibold">Cacao Fino de Aroma</p>
              </div>
              <div>
                <span className="text-muted">Agricultor</span>
                <p className="text-heading font-semibold">Carlos Mendoza</p>
              </div>
              <div>
                <span className="text-muted">Altitud</span>
                <p className="text-heading font-semibold">800 msnm</p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="surface-panel p-6">
            <h3 className="text-lg font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Certificaciones
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="flex flex-col items-center p-3 rounded-2xl border border-[var(--color-border)] hover:bg-[rgba(223,134,170,0.08)] transition-all"
                >
                  <span className="text-3xl mb-1">{cert.icon}</span>
                  <span className="text-xs text-center text-heading font-medium">
                    {cert.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Stats */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-[16px] p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(223,134,170,0.15)] via-transparent to-[rgba(87,41,214,0.15)]" />
            <div className="relative">
              <h3 className="text-lg font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Impacto Generado
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">CO₂ Capturado</span>
                  <span className="text-heading font-bold">24 kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Ingreso Agricultor</span>
                  <span className="text-heading font-bold">$180</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Familias Beneficiadas</span>
                  <span className="text-heading font-bold">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
