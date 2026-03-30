'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTreeRegistry, useTreeTimeline, type TreeTimelineEvent } from '@/hooks/useTreeRegistry';

interface TraceabilityStep {
  id: number;
  title: string;
  date: string;
  location: string;
  icon: string;
  status: 'completed' | 'in-progress' | 'pending';
  details: string;
  txHash?: string;
}

const EVENT_DISPLAY: Record<string, { title: string; icon: string; details: string }> = {
  adopted: { title: 'Tree Adopted', icon: '🤝', details: 'Tree adoption recorded on-chain' },
  audit_approved: { title: 'Audit Approved', icon: '✅', details: 'Guardian approved the tree audit' },
  status_changed: { title: 'Status Updated', icon: '🔄', details: 'Tree status changed on-chain' },
};

export default function TraceabilityPage() {
  const t = useTranslations('dashboard.traceability');
  const { trees, isLoading: treesLoading } = useTreeRegistry();
  const [selectedTreeId, setSelectedTreeId] = useState<number>(1);
  const { timeline, isLoading: timelineLoading } = useTreeTimeline(selectedTreeId);

  // Build traceability steps from on-chain events
  const traceabilitySteps: TraceabilityStep[] = timeline.length > 0
    ? timeline.map((event, index) => {
        const display = EVENT_DISPLAY[event.type] || EVENT_DISPLAY.status_changed;
        return {
          id: index + 1,
          title: event.type === 'status_changed' ? `Status: ${event.newStatus}` : display.title,
          date: `Block #${event.blockNumber}`,
          location: event.transactionHash ? `${event.transactionHash.slice(0, 10)}...` : '',
          icon: display.icon,
          status: 'completed' as const,
          details: display.details,
          txHash: event.transactionHash,
        };
      })
    : [
        { id: 1, title: t('steps.planting.title'), date: '-', location: '-', icon: '🌱', status: 'pending' as const, details: 'No on-chain events yet' },
      ];

  // Get blockchain info from the first event
  const firstEvent = timeline[0];
  const blockchainInfo = {
    transactionHash: firstEvent?.transactionHash || '0x...',
    blockNumber: firstEvent ? String(firstEvent.blockNumber) : '-',
    timestamp: '-',
    network: 'Anvil Local (Chain 31337)',
  };

  const certifications = [
    { name: t('certifications.fairTrade'), icon: '✅', color: 'green' },
    { name: t('certifications.organic'), icon: '🌿', color: 'emerald' },
    { name: t('certifications.carbonNeutral'), icon: '🌍', color: 'blue' },
    { name: t('certifications.rainforest'), icon: '🐸', color: 'teal' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-heading mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('title')}
          </h1>
          <p className="text-muted">
            {t('subtitle')}
          </p>
        </div>
        <div className="surface-panel px-4 py-2">
          <select
            value={selectedTreeId}
            onChange={(e) => setSelectedTreeId(Number(e.target.value))}
            className="bg-transparent text-heading font-medium focus:outline-none cursor-pointer"
          >
            {treesLoading ? (
              <option>Loading...</option>
            ) : trees.length > 0 ? (
              trees.map((tree) => (
                <option key={tree.id} value={tree.id}>
                  Cacao #{String(tree.id).padStart(3, '0')} ({tree.status})
                </option>
              ))
            ) : (
              <option value="1">No trees on-chain</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="surface-panel p-6">
            <h2 className="text-xl font-bold text-heading mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('timeline.title')}
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
                          <span>{t('timeline.verified')}</span>
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
              {t('blockchain.title')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                <span className="text-sm text-muted">{t('blockchain.transactionHash')}</span>
                <span className="text-sm text-heading font-mono">
                  {blockchainInfo.transactionHash.slice(0, 20)}...
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                <span className="text-sm text-muted">{t('blockchain.block')}</span>
                <span className="text-sm text-heading font-mono">{blockchainInfo.blockNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                <span className="text-sm text-muted">{t('blockchain.timestamp')}</span>
                <span className="text-sm text-heading">{blockchainInfo.timestamp}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted">{t('blockchain.network')}</span>
                <span className="text-sm text-heading">{blockchainInfo.network}</span>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 w-full px-4 py-2 rounded-2xl border border-[var(--color-border)] text-sm font-medium text-heading hover:bg-[rgba(223,134,170,0.08)] transition-all"
            >
              {t('blockchain.viewExplorer')} →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Info */}
          <div className="surface-panel p-6">
            <h3 className="text-lg font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('productInfo.title')}
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted">{t('productInfo.treeId')}</span>
                <p className="text-heading font-semibold">#TREE-2024-001</p>
              </div>
              <div>
                <span className="text-muted">{t('productInfo.variety')}</span>
                <p className="text-heading font-semibold">{t('productInfo.varietyValue')}</p>
              </div>
              <div>
                <span className="text-muted">{t('productInfo.farmer')}</span>
                <p className="text-heading font-semibold">Carlos Mendoza</p>
              </div>
              <div>
                <span className="text-muted">{t('productInfo.altitude')}</span>
                <p className="text-heading font-semibold">800 {t('productInfo.masl')}</p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="surface-panel p-6">
            <h3 className="text-lg font-bold text-heading mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('certifications.title')}
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
                {t('impact.title')}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('impact.co2Captured')}</span>
                  <span className="text-heading font-bold">24 kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('impact.farmerIncome')}</span>
                  <span className="text-heading font-bold">$180</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('impact.familiesBenefited')}</span>
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
