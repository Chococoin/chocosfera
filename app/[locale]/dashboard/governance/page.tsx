'use client';

import { useGovernance, type Proposal } from '@/hooks/useGovernance';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectWallet } from '@/components/wallet';

export default function GovernancePage() {
  const { proposals, totalProposals, thresholdPct, activeCount, isLoading, error } = useGovernance();
  const { isWeb3Available } = useWallet();
  const { isAdult } = useAuth();

  const stats = [
    { label: 'Total Proposals', value: totalProposals, icon: '📋' },
    { label: 'Active', value: activeCount, icon: '🟢' },
    { label: 'Threshold', value: `${thresholdPct}%`, icon: '📊' },
  ];

  // Voting class labels from PROPUESTA_POP
  const votingClasses = [
    { name: 'Productores', pct: 35, color: 'bg-green-500', strategy: 'Direct' },
    { name: 'Adoptantes', pct: 40, color: 'bg-blue-500', strategy: 'Quadratic' },
    { name: 'Comunidad', pct: 25, color: 'bg-purple-500', strategy: 'Direct' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <span>🏛️</span>
              Governance
            </h1>
            <p className="text-white/90">
              HybridVoting — Proposals and voting for the Chocosfera DAO
            </p>
          </div>
          <div className="hidden md:block text-6xl">⚖️</div>
        </div>
      </div>

      {/* Voting Classes Overview */}
      <div className="surface-panel p-6">
        <h3 className="text-sm font-semibold text-muted mb-3">Voting Power Distribution</h3>
        <div className="flex rounded-xl overflow-hidden h-8 mb-3">
          {votingClasses.map((vc) => (
            <div
              key={vc.name}
              className={`${vc.color} flex items-center justify-center text-white text-xs font-bold`}
              style={{ width: `${vc.pct}%` }}
            >
              {vc.pct}%
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted">
          {votingClasses.map((vc) => (
            <span key={vc.name}>
              {vc.name} ({vc.strategy})
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-heading">
                  {isLoading ? '...' : stat.value}
                </p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Wallet requirement */}
      {!isAdult && (
        <div className="surface-panel p-8 text-center">
          <span className="text-5xl mb-4 block">🔒</span>
          <h3 className="text-lg font-bold text-heading mb-2">Adult Verification Required</h3>
          <p className="text-muted text-sm">
            Governance participation requires age verification and a connected wallet.
          </p>
        </div>
      )}

      {isAdult && !isWeb3Available && (
        <div className="surface-panel p-8 text-center">
          <span className="text-5xl mb-4 block">🔗</span>
          <h3 className="text-lg font-bold text-heading mb-2">Connect Your Wallet</h3>
          <p className="text-muted text-sm mb-4">
            Connect a wallet to vote on proposals.
          </p>
          <ConnectWallet />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="surface-panel p-4 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Proposals List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-panel p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <div className="surface-panel p-12 text-center">
          <span className="text-6xl mb-4 block">📭</span>
          <h3 className="text-xl font-bold text-heading mb-2">No Proposals Yet</h3>
          <p className="text-muted text-sm">
            Proposals will appear here once Guardians or Adoptantes create them through the HybridVoting contract.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const endDate = new Date(proposal.endTimestamp * 1000);
  const createdDate = new Date(proposal.createdTimestamp * 1000);

  return (
    <div className="surface-panel p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-heading">
            #{proposal.id} — {proposal.title}
          </h3>
          <p className="text-xs text-muted mt-1">
            Created at block #{proposal.blockNumber}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            proposal.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {proposal.isActive ? 'Active' : 'Ended'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-muted">Options</span>
          <p className="text-heading font-medium">{proposal.numOptions}</p>
        </div>
        <div>
          <span className="text-muted">Ends</span>
          <p className="text-heading font-medium">
            {proposal.isActive
              ? endDate.toLocaleString()
              : 'Expired'}
          </p>
        </div>
        <div>
          <span className="text-muted">Tx</span>
          <p className="text-heading font-mono text-xs">
            {proposal.transactionHash.slice(0, 10)}...
          </p>
        </div>
      </div>
    </div>
  );
}
