'use client';

import { useState } from 'react';
import { Modal, Alert, FormInput, FormTextarea, FormSelect } from '@/components/ui';
import { StoryFormData } from './types';

interface StoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StoryFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function StoryCreationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: StoryCreationModalProps) {
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    content: '',
    status: 'draft',
    isPublic: false,
  });

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        content: '',
        status: 'draft',
        isPublic: false,
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="✍️ Nueva Historia"
      headerGradient=""
      disabled={isSubmitting}
      maxWidth="3xl"
    >
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        <FormInput
          label="Título de la historia"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: La primera aventura"
        />

        <FormTextarea
          label="Contenido (Markdown)"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Escribe tu historia aquí... Puedes usar Markdown para formatear el texto."
          rows={12}
          className="font-mono text-sm"
          hint="💡 Tip: Usa Markdown para dar formato. Ejemplo: **negrita**, *cursiva*, ## Título"
        />

        <FormSelect
          label="Estado"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
          options={[
            { value: 'draft', label: '📝 Borrador (no visible)' },
            { value: 'published', label: '✅ Publicado (visible)' },
          ]}
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="isPublic" className="text-sm font-medium text-gray-900 dark:text-white">
            🌍 Hacer pública esta historia (visible para todos los usuarios)
          </label>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
              Creando...
            </>
          ) : (
            <>💾 Crear Historia</>
          )}
        </button>
      </div>
    </Modal>
  );
}
