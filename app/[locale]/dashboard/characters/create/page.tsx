'use client';

/**
 * Character Creation Wizard
 * Multi-step form to create a new character
 */

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

type CharacterType = 'cacao' | 'chocolate' | 'farmer' | 'other';

interface CharacterFormData {
  name: string;
  characterType: CharacterType;
  icon: string;
  description: string;
  personality: string;
  abilities: string[];
  motto: string;
  arrivalStory: string;
  isPublic: boolean;
}

const CHARACTER_ICONS = [
  '🍫', '🍬', '🌰', '🥜', '🌱', '🌳', '🌾', '👨‍🌾', '👩‍🌾',
  '🎭', '🎨', '✨', '⭐', '🌟', '💫', '🔮', '🎪', '🎡',
  '🦋', '🐝', '🐞', '🦜', '🌺', '🌸', '🌼', '🌻', '🌹',
];

export default function CreateCharacterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard.characters.create');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    characterType: 'cacao',
    icon: '🎭',
    description: '',
    personality: '',
    abilities: [],
    motto: '',
    arrivalStory: '',
    isPublic: false,
  });

  const [currentAbility, setCurrentAbility] = useState('');

  // Character types with translations
  const CHARACTER_TYPES = [
    {
      value: 'cacao' as CharacterType,
      label: t('characterTypes.cacao.label'),
      icon: '🍫',
      description: t('characterTypes.cacao.description'),
    },
    {
      value: 'chocolate' as CharacterType,
      label: t('characterTypes.chocolate.label'),
      icon: '🍬',
      description: t('characterTypes.chocolate.description'),
    },
    {
      value: 'farmer' as CharacterType,
      label: t('characterTypes.farmer.label'),
      icon: '👨‍🌾',
      description: t('characterTypes.farmer.description'),
    },
    {
      value: 'other' as CharacterType,
      label: t('characterTypes.other.label'),
      icon: '🎭',
      description: t('characterTypes.other.description'),
    },
  ];

  const updateFormData = (field: keyof CharacterFormData, value: CharacterFormData[keyof CharacterFormData]) => {
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

  const nextStep = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.name.trim()) {
        setError(t('errors.nameRequired'));
        return;
      }
      if (formData.name.length < 2) {
        setError(t('errors.nameTooShort'));
        return;
      }
    }

    if (step === 2) {
      if (!formData.description.trim()) {
        setError(t('errors.descriptionRequired'));
        return;
      }
      if (formData.description.length < 20) {
        setError(t('errors.descriptionTooShort'));
        return;
      }
    }

    if (step === 3) {
      if (!formData.arrivalStory.trim()) {
        setError(t('errors.storyRequired'));
        return;
      }
      if (formData.arrivalStory.length < 50) {
        setError(t('errors.storyTooShort'));
        return;
      }
    }

    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          characterType: formData.characterType,
          description: formData.description,
          personality: formData.personality,
          abilities: formData.abilities,
          motto: formData.motto,
          isPublic: formData.isPublic,
          // Initial story will be committed separately
          initialStory: formData.arrivalStory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.createError'));
      }

      // Success! Redirect to character page
      router.push(`/${locale}/dashboard/characters/${data.character.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknownError'));
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-sm text-muted">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${locale}/dashboard/characters`)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 inline-flex items-center gap-2"
          >
            <span>←</span>
            {t('backButton')}
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('stepProgress', { step })}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span className={step >= 1 ? 'text-purple-600 dark:text-purple-400 font-semibold' : ''}>
              {t('steps.basics')}
            </span>
            <span className={step >= 2 ? 'text-purple-600 dark:text-purple-400 font-semibold' : ''}>
              {t('steps.description')}
            </span>
            <span className={step >= 3 ? 'text-purple-600 dark:text-purple-400 font-semibold' : ''}>
              {t('steps.story')}
            </span>
            <span className={step >= 4 ? 'text-purple-600 dark:text-purple-400 font-semibold' : ''}>
              {t('steps.confirm')}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">❌ {error}</p>
          </div>
        )}

        {/* Form Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('step1.title')}
                </h2>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('step1.nameLabel')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder={t('step1.namePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('step1.characterCount', { count: formData.name.length })}
                </p>
              </div>

              {/* Character Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t('step1.typeLabel')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {CHARACTER_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateFormData('characterType', type.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.characterType === type.value
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{type.icon}</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {type.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {type.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t('step1.iconLabel')}
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-5xl">{formData.icon}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('step1.iconDescription')}
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
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('step2.title')}
                </h2>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('step2.descriptionLabel')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder={t('step2.descriptionPlaceholder')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('step2.descriptionCount', { count: formData.description.length })}
                </p>
              </div>

              {/* Personality */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('step2.personalityLabel')}
                </label>
                <textarea
                  value={formData.personality}
                  onChange={(e) => updateFormData('personality', e.target.value)}
                  placeholder={t('step2.personalityPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('step2.personalityCount', { count: formData.personality.length })}
                </p>
              </div>

              {/* Abilities */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('step2.abilitiesLabel')}
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentAbility}
                    onChange={(e) => setCurrentAbility(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAbility())}
                    placeholder={t('step2.abilityPlaceholder')}
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
                  {t('step2.abilitiesCount', { count: formData.abilities.length })}
                </p>
              </div>

              {/* Motto */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('step2.mottoLabel')}
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
                  {t('step2.mottoCount', { count: formData.motto.length })}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Arrival Story */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('step3.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('step3.subtitle')}
                </p>
              </div>

              {/* Inspiration Box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                  <span>💡</span>
                  {t('step3.inspirationTitle')}
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 italic mb-3">
                  &ldquo;{t('step3.inspirationQuote')}&rdquo;
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {t('step3.inspirationText')}
                </p>
              </div>

              {/* Arrival Story */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('step3.storyLabel')}
                </label>
                <textarea
                  value={formData.arrivalStory}
                  onChange={(e) => updateFormData('arrivalStory', e.target.value)}
                  placeholder={t('step3.storyPlaceholder')}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('step3.storyCount', { count: formData.arrivalStory.length })}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💾 {t('step3.commitInfo', { filename: 'historia/01-llegada.md' })}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review and Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('step4.title')}
                </h2>
              </div>

              {/* Character Preview */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                {/* Character Header */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-6xl">{formData.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {formData.name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 text-sm font-semibold rounded-full">
                      {CHARACTER_TYPES.find((t) => t.value === formData.characterType)?.label}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('step4.descriptionLabel')}
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200">{formData.description}</p>
                </div>

                {/* Personality */}
                {formData.personality && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('step4.personalityLabel')}
                    </h4>
                    <p className="text-gray-800 dark:text-gray-200">{formData.personality}</p>
                  </div>
                )}

                {/* Abilities */}
                {formData.abilities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('step4.abilitiesLabel')}
                    </h4>
                    <ul className="space-y-1">
                      {formData.abilities.map((ability, index) => (
                        <li key={index} className="text-gray-800 dark:text-gray-200">
                          ✨ {ability}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Motto */}
                {formData.motto && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('step4.mottoLabel')}
                    </h4>
                    <p className="text-gray-800 dark:text-gray-200 italic">&ldquo;{formData.motto}&rdquo;</p>
                  </div>
                )}

                {/* Arrival Story Preview */}
                <div className="mt-6 pt-6 border-t border-purple-300 dark:border-purple-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('step4.arrivalStoryLabel')}
                  </h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {formData.arrivalStory}
                    </p>
                  </div>
                </div>
              </div>

              {/* Visibility Settings */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t('step4.visibilityLabel')}
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
                      <span className="font-bold text-gray-900 dark:text-white">{t('step4.privateTitle')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('step4.privateDescription')}
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
                      <span className="font-bold text-gray-900 dark:text-white">{t('step4.publicTitle')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('step4.publicDescription')}
                    </p>
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <span>ℹ️</span>
                  {t('step4.infoTitle')}
                </h4>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <span>1.</span>
                    <span>
                      {t('step4.infoPoint1')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>2.</span>
                    <span>
                      {t('step4.infoPoint2')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>3.</span>
                    <span>
                      {t('step4.infoPoint3')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>4.</span>
                    <span>
                      {t('step4.infoPoint4')}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← {t('buttons.previous')}
            </button>

            <div className="flex gap-3">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  {t('buttons.next')} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      {t('buttons.creating')}
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      {t('buttons.create')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
