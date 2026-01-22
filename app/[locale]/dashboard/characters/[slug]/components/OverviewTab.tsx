'use client';

import { Card, CardHeader } from '@/components/ui';
import { Character } from './types';

interface OverviewTabProps {
  character: Character;
}

export function OverviewTab({ character }: OverviewTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <Card>
        <CardHeader title="Descripción" />
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {character.description}
        </p>
      </Card>

      {/* Personality */}
      {character.personality && (
        <Card>
          <CardHeader title="Personalidad" />
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {character.personality}
          </p>
        </Card>
      )}

      {/* Abilities */}
      {character.abilities && character.abilities.length > 0 && (
        <Card>
          <CardHeader title="Habilidades Especiales" />
          <ul className="space-y-3">
            {character.abilities.map((ability, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
              >
                <span className="text-2xl">✨</span>
                <span className="text-gray-800 dark:text-gray-200 flex-1">
                  {ability}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Motto */}
      {character.motto && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">
            Lema
          </h2>
          <p className="text-lg text-amber-800 dark:text-amber-200 italic font-semibold">
            &ldquo;{character.motto}&rdquo;
          </p>
        </div>
      )}

      {/* Git Info */}
      <Card>
        <CardHeader title="Información de Repositorio" />
        <div className="space-y-3 font-mono text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Path: </span>
            <span className="text-gray-900 dark:text-white">
              {character.gitPath}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Último commit:{' '}
            </span>
            <span className="text-gray-900 dark:text-white">
              {character.lastCommitSha.substring(0, 7)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Mensaje: </span>
            <span className="text-gray-900 dark:text-white">
              {character.lastCommitMessage}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Fecha: </span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(character.lastCommitDate)}
            </span>
          </div>
        </div>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader title="Metadata" />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Creado: </span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(character.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Actualizado:{' '}
            </span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(character.updatedAt)}
            </span>
          </div>
          {character.publishedAt && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Publicado:{' '}
              </span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(character.publishedAt)}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-600 dark:text-gray-400">Slug: </span>
            <span className="text-gray-900 dark:text-white font-mono">
              {character.slug}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
