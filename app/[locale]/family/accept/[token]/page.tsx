'use client';

/**
 * Accept Family Invitation Page
 * Allows users to accept or decline family invitations via email link
 */

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';

interface InvitationDetails {
  id: string;
  recipientEmail: string;
  inviterName: string;
  familyName: string;
  sentAt: string;
  expiresAt: string;
}

export default function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [token, setToken] = useState<string>('');
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setToken(resolvedParams.token);
    });
  }, [params]);

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchInvitation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/family/accept/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar la invitación');
      }

      setInvitation(data.invitation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (action: 'accept' | 'decline') => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(`/api/family/accept/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la invitación');
      }

      setSuccess(data.message);

      // Refresh user data to get updated familyId
      if (action === 'accept') {
        await refreshUser();
        // Redirect to family page after a short delay
        setTimeout(() => {
          router.push(`/${locale}/dashboard/family`);
        }, 2000);
      } else {
        // Redirect to dashboard after declining
        setTimeout(() => {
          router.push(`/${locale}/dashboard`);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Cargando invitación...
          </p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <div className="text-center mb-6">
            <span className="text-7xl block mb-4">❌</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invitación No Válida
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Posibles razones:
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• El enlace ha expirado</li>
              <li>• La invitación ya fue procesada</li>
              <li>• El enlace es inválido</li>
            </ul>
          </div>

          <Link
            href={`/${locale}/dashboard`}
            className="block w-full text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <div className="text-center">
            <span className="text-7xl block mb-4">
              {success.includes('unido') ? '🎉' : '👋'}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {success.includes('unido') ? '¡Bienvenido!' : 'Invitación Rechazada'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{success}</p>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Redirigiendo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <div className="text-center mb-6">
            <span className="text-7xl block mb-4">🔐</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Inicia Sesión para Continuar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Debes iniciar sesión con la cuenta <strong>{invitation?.recipientEmail}</strong>{' '}
              para aceptar esta invitación.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href={`/${locale}/login?redirect=${encodeURIComponent(`/family/accept/${token}`)}`}
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Iniciar Sesión
            </Link>
            <Link
              href={`/${locale}/register?redirect=${encodeURIComponent(`/family/accept/${token}`)}`}
              className="block w-full text-center px-6 py-3 border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
            >
              Crear Cuenta
            </Link>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Si aún no tienes cuenta, regístrate con el email{' '}
              <strong>{invitation?.recipientEmail}</strong> para aceptar la invitación.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white text-center">
          <span className="text-7xl block mb-4">👨‍👩‍👧‍👦</span>
          <h1 className="text-3xl font-bold mb-2">Invitación Familiar</h1>
          <p className="text-white/90">
            Has sido invitado/a a unirte a una familia en Chocósfera
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Invitation Details */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Detalles de la Invitación
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Te invita:
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {invitation?.inviterName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Familia:
                </p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {invitation?.familyName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enviado a:
                </p>
                <p className="text-gray-900 dark:text-white">
                  {invitation?.recipientEmail}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expira:
                </p>
                <p className="text-gray-900 dark:text-white">
                  {invitation
                    ? new Date(invitation.expiresAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <span>✨</span>
              ¿Qué obtienes al unirte?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span>🌳</span>
                <span>Compartir y gestionar árboles de cacao en familia</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🎭</span>
                <span>Colaborar en personajes e historias juntos</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📊</span>
                <span>Ver el progreso e impacto de toda la familia</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🎁</span>
                <span>Acceder a beneficios y recompensas familiares</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-center">❌ {error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleResponse('accept')}
              disabled={isProcessing}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <span>✅</span>
                  Aceptar Invitación
                </>
              )}
            </button>

            <button
              onClick={() => handleResponse('decline')}
              disabled={isProcessing}
              className="flex-1 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>❌</span>
              Rechazar
            </button>
          </div>

          {/* Info */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Solo puedes pertenecer a una familia a la vez. Si aceptas, no podrás
              unirte a otra familia hasta que salgas de esta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
