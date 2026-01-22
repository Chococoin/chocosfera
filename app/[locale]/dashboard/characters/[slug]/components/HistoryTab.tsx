'use client';

import { Commit, Character } from './types';
import { Card, CardHeader, Alert } from '@/components/ui';
import { LoadingState } from '@/components/ui';

interface HistoryTabProps {
  history: Commit[];
  character: Character;
  isLoading: boolean;
}

export function HistoryTab({ history, character, isLoading }: HistoryTabProps) {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora mismo';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 30) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingState message="Cargando historial..." />;
  }

  if (history.length === 0) {
    return (
      <Alert variant="warning" icon="📭">
        No hay commits en el historial todavía
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader title={`Historial de Commits (${character.stats.commitsCount} total)`} />
      <div className="space-y-4">
        {history.map((commit) => (
          <CommitItem key={commit.sha} commit={commit} formatTime={formatRelativeTime} />
        ))}
      </div>
    </Card>
  );
}

interface CommitItemProps {
  commit: Commit;
  formatTime: (date: string) => string;
}

function CommitItem({ commit, formatTime }: CommitItemProps) {
  return (
    <div className="border-l-4 border-purple-500 pl-4 py-2">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
            {commit.sha.substring(0, 7)}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatTime(commit.date)}
          </span>
        </div>
      </div>
      <p className="text-gray-900 dark:text-white font-semibold mb-1">
        {commit.message}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {commit.author} ({commit.email})
      </p>
    </div>
  );
}
