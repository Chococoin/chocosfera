'use client';

/**
 * Character Edit Page
 * Edit an existing character
 */

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';

type CharacterType = 'cacao' | 'chocolate' | 'farmer' | 'other';

interface Character {
  id: string;
  name: string;
  slug: string;
  characterType: CharacterType;
  description: string;
  personality: string;
  abilities: string[];
  motto: string;
  isPublic: boolean;
  assets: {
    icon?: string;
  };
}

const CHARACTER_TYPES = [
  { value: 'cacao' as CharacterType, label: 'Cacao', icon: '🍫', description: 'Un grano de cacao lleno de potencial y magia' },
  { value: 'chocolate' as CharacterType, label: 'Chocolate', icon: '🍬', description: 'Chocolate transformado, dulce y versátil' },
  { value: 'farmer' as CharacterType, label: 'Agricultor', icon: '👨‍🌾', description: 'Guardián de las plantas y conocedor de la tierra' },
  { value: 'other' as CharacterType, label: 'Otro', icon: '🎭', description: 'Un personaje único con su propia historia' },
];

const CHARACTER_ICONS = [
  '🍫', '🍬', '🌰', '🥜', '🌱', '🌳', '🌾', '👨‍🌾', '👩‍🌾',
  '🎭', '🎨', '✨', '⭐', '🌟', '💫', '🔮', '🎪', '🎡',
  '🦋', '🐝', '🐞', '🦜', '🌺', '🌸', '🌼', '🌻', '🌹',
];

export default function EditCharacterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [slug, setSlug] = useState<string>('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAbility, setCurrentAbility] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    characterType: 'cacao' as CharacterType,
    icon: '🎭',
    description: '',
    personality: '',
    abilities: [] as string[],
    motto: '',
    isPublic: false,
  });

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchCharacter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchCharacter = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all characters to find ID from slug
      const listResponse = await fetch('/api/characters');
      if (!listResponse.ok) {
        throw new Error('Error al obtener personajes');
      }

      const listData = await listResponse.json();
      const foundCharacter = listData.characters.find(
        (c: Character) => c.slug === slug
      );

      if (!foundCharacter) {
        throw new Error('Personaje no encontrado');
      }

      // Get full character details
      const response = await fetch(`/api/characters/${foundCharacter.id}`);
      if (!response.ok) {
        throw new Error('Error al obtener el personaje');
      }

      const data = await response.json();
      const char = data.character;

      // Check permissions
      if (!data.permissions.canEdit) {
        throw new Error('No tienes permiso para editar este personaje');
      }

      setCharacter(char);

      // Populate form
      setFormData({
        name: char.name,
        characterType: char.characterType,
        icon: char.assets.icon || '🎭',
        description: char.description,
        personality: char.personality || '',
        abilities: char.abilities || [],
        motto: char.motto || '',
        isPublic: char.isPublic,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | string[] | boolean | CharacterType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const addAbility = () => {
    if (currentAbility.trim() && formData.abilities.length < 5) {
      updateFormData('abilities', [...formData.abilities, currentAbility.trim()]);
      setCurrentAbility('');
    }
  };

  const removeAbility = (index: number) => {
    updateFormData(
      'abilities',
      formData.abilities.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!character) return;

    // Validation
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      setError('La descripción debe tener al menos 20 caracteres');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          personality: formData.personality,
          abilities: formData.abilities,
          motto: formData.motto,
          isPublic: formData.isPublic,
          assets: {
            icon: formData.icon,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el personaje');
      }

      // Success! Redirect to character page
      router.push(`/${locale}/dashboard/characters/${character.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-sm text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error && !character) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-200 mb-4">❌ {error}</p>
          <Link
            href={`/${locale}/dashboard/characters`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            ← Volver a Mis Personajes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/characters/${slug}`}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 inline-flex items-center gap-2"
          >
            <span>←</span>
            Volver al Personaje
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Editar Personaje
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Actualiza la información de tu personaje
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">❌ {error}</p>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 space-y-6">
            {/* Name (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Nombre del Personaje
              </label>
              <input
                type="text"
                value={formData.name}
                disabled
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                El nombre no se puede cambiar después de crear el personaje
              </p>
            </div>

            {/* Character Type (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Tipo de Personaje
              </label>
              <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {CHARACTER_TYPES.find((t) => t.value === formData.characterType)?.icon}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {CHARACTER_TYPES.find((t) => t.value === formData.characterType)?.label}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                El tipo no se puede cambiar después de crear el personaje
              </p>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Ícono del Personaje
              </label>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-5xl">{formData.icon}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selecciona un ícono que represente a tu personaje
                </p>
              </div>
              <div className="grid grid-cols-9 gap-2">
                {CHARACTER_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateFormData('icon', icon)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.icon === icon
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 scale-110'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Descripción del Personaje *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe a tu personaje: ¿Cómo es? ¿Qué lo hace único?"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.description.length}/500 caracteres (mínimo 20)
              </p>
            </div>

            {/* Personality */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Personalidad
              </label>
              <textarea
                value={formData.personality}
                onChange={(e) => updateFormData('personality', e.target.value)}
                placeholder="Ej: Curioso, aventurero, líder natural, protector de su familia..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={300}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.personality.length}/300 caracteres
              </p>
            </div>

            {/* Abilities */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Habilidades Especiales
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentAbility}
                  onChange={(e) => setCurrentAbility(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAbility())}
                  placeholder="Ej: Puede hablar con plantas de cacao"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={addAbility}
                  disabled={!currentAbility.trim() || formData.abilities.length >= 5}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  Agregar
                </button>
              </div>
              <div className="space-y-2">
                {formData.abilities.map((ability, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">
                      ✨ {ability}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAbility(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {formData.abilities.length}/5 habilidades
              </p>
            </div>

            {/* Motto */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Lema o Frase Característica
              </label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => updateFormData('motto', e.target.value)}
                placeholder='Ej: "La magia del cacao nos une a todos"'
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={150}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.motto.length}/150 caracteres
              </p>
            </div>

            {/* Visibility Settings */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Visibilidad del Personaje
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => updateFormData('isPublic', false)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    !formData.isPublic
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔒</span>
                    <span className="font-bold text-gray-900 dark:text-white">Privado</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Solo tú y tu familia pueden ver este personaje
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => updateFormData('isPublic', true)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    formData.isPublic
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🌍</span>
                    <span className="font-bold text-gray-900 dark:text-white">Público</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Todos pueden ver tu personaje y su historia
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/dashboard/characters/${slug}`}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
