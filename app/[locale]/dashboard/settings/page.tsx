'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserStatus } from '@prisma/client';
import { RestartOnboardingButton } from '@/components/Onboarding';

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMinor } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [showCoinPackages, setShowCoinPackages] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatarUrl || '👤');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  // User profile data from auth context
  const userProfile = {
    nick: user?.nick || '',
    email: user?.email || '',
    avatar: selectedAvatar,
  };

  const subscriptions = [
    {
      id: 1,
      plan: 'Seed - Sprout',
      status: 'active',
      price: '€2.99/mes',
      nextPayment: '2024-11-14',
    },
    {
      id: 2,
      plan: 'Fruit - Cacao Pod',
      status: 'active',
      price: '€15.99/mes',
      nextPayment: '2024-11-20',
    },
  ];

  const chococoinsTransactions = [
    {
      id: 1,
      type: 'Ganados - Suscripción Activa',
      date: '2024-10-01',
      amount: '+50',
    },
    {
      id: 2,
      type: 'Canjeados - Tableta de Chocolate',
      date: '2024-09-28',
      amount: '-30',
    },
    {
      id: 3,
      type: 'Ganados - Árbol Adoptado',
      date: '2024-09-15',
      amount: '+100',
    },
  ];

  const activeSessions = [
    {
      id: 1,
      device: 'MacBook Pro - Chrome',
      location: 'Madrid, España',
      lastActive: 'Ahora',
      current: true,
    },
    {
      id: 2,
      device: 'iPhone 15 - Safari',
      location: 'Madrid, España',
      lastActive: 'Hace 2 horas',
      current: false,
    },
  ];

  const tabs = [
    { id: 'profile', label: t('profile.title'), icon: '👤' },
    { id: 'verification', label: 'Verificación de Edad', icon: '✅' },
    { id: 'subscriptions', label: t('subscriptions.title'), icon: '💳' },
    { id: 'account', label: t('account.title'), icon: '⚙️' },
    { id: 'notifications', label: t('notifications.title'), icon: '🔔' },
    { id: 'chococoins', label: t('chococoins.title'), icon: '🪙' },
    { id: 'privacy', label: t('privacy.title'), icon: '🔒' },
  ];

  const chococoinPackages = [
    {
      id: 'starter',
      name: '100 ChocoCoins',
      price: '€5.00',
      coins: 100,
      description: 'Paquete inicial perfecto para empezar',
    },
    {
      id: 'popular',
      name: '500 ChocoCoins',
      price: '€20.00',
      coins: 500,
      description: 'El más popular - Ahorra €5',
      discount: true,
      popular: true,
    },
    {
      id: 'premium',
      name: '1200 ChocoCoins',
      price: '€40.00',
      coins: 1200,
      description: 'Mejor valor - Ahorra €20',
      discount: true,
    },
    {
      id: 'mega',
      name: '3000 ChocoCoins',
      price: '€90.00',
      coins: 3000,
      description: 'Pack mega - Ahorra €60',
      discount: true,
    },
  ];

  const handleBuyCoins = async (packageId: string) => {
    try {
      setIsProcessingPayment(true);
      const response = await fetch('/api/chococoins/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar el pago');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error buying coins:', error);
      alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAvatarUpdate = async (emoji: string) => {
    try {
      setIsSavingAvatar(true);
      setSelectedAvatar(emoji);

      const response = await fetch('/api/user/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: emoji }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el avatar');
      }

      // Success feedback could be added here (toast notification, etc.)
    } catch (error) {
      console.error('Error updating avatar:', error);
      // Revert on error
      setSelectedAvatar(user?.avatarUrl || '👤');
      alert('Error al actualizar el avatar. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      // Replace the current locale in the pathname with the new one
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.replace(newPathname);
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <span>⚙️</span>
              {t('title')}
            </h1>
            <p className="text-white/90">{t('subtitle')}</p>
          </div>
          <div className="hidden md:block text-6xl">🛠️</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-4 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center gap-2 justify-center">
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('profile.title')}
            </h2>

            {/* Avatar - Emoji Selector */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center text-5xl">
                {userProfile.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Elige tu emoji favorito como avatar
                </p>
                <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md">
                  {['😊', '🎉', '🌟', '🚀', '🎨', '🎭', '🎪', '🎬', '🎮', '🎯', '🎲', '🎸', '🍫', '🍪', '🍰', '🧁', '🌈', '🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌼', '🦄', '🦋', '🐝', '🐙', '🦊', '🐻', '🐼', '🐨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleAvatarUpdate(emoji)}
                      disabled={isSavingAvatar}
                      className={`text-2xl p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        userProfile.avatar === emoji ? 'bg-purple-200 dark:bg-purple-900/50 ring-2 ring-purple-500' : ''
                      }`}
                      title={`Seleccionar ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Tu emoji te representa en toda la Chocósfera
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              {/* Info Banner for Minors */}
              {isMinor && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <span>🔒</span>
                    Protección de Identidad
                  </h4>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Para proteger tu identidad, solo usamos tu nick (apodo). No necesitas proporcionar tu nombre real.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isMinor ? 'Tu Nick (Apodo)' : t('profile.username')}
                </label>
                <input
                  type="text"
                  defaultValue={userProfile.nick}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ej: choco_lover"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tu nick es como te conocerán otros usuarios en la Chocósfera
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.email')}
                </label>
                <input
                  type="email"
                  defaultValue={userProfile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  El email no puede cambiarse por seguridad
                </p>
              </div>

              {/* Only show name fields for verified adults */}
              {!isMinor && user?.status === UserStatus.ADULT_VERIFIED && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre (Opcional)
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.firstName || ''}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellido (Opcional)
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.lastName || ''}
                      placeholder="Tu apellido"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  {t('profile.saveChanges')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Tab - Age/KYC Verification */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className={`rounded-xl border-2 p-8 ${
            user?.status === UserStatus.MINOR
              ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
              : user?.status === UserStatus.ADULT_PENDING
              ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-700'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
          }`}>
            <div className="text-center mb-6">
              <span className="text-7xl block mb-4">
                {user?.status === UserStatus.MINOR ? '🎓' : user?.status === UserStatus.ADULT_PENDING ? '⏳' : '✅'}
              </span>
              <h2 className="text-2xl font-bold mb-2" style={{
                color: user?.status === UserStatus.MINOR
                  ? 'var(--tw-prose-bold)'
                  : user?.status === UserStatus.ADULT_PENDING
                  ? 'var(--tw-prose-bold)'
                  : 'var(--tw-prose-bold)'
              }}>
                Estado de Verificación:{' '}
                {user?.status === UserStatus.MINOR && 'Cuenta de Estudiante'}
                {user?.status === UserStatus.ADULT_PENDING && 'Verificación Pendiente'}
                {user?.status === UserStatus.ADULT_VERIFIED && 'Adulto Verificado'}
              </h2>
              <p className="text-sm opacity-90">
                {user?.status === UserStatus.MINOR && 'Tu cuenta está registrada como estudiante con funciones restringidas para tu protección.'}
                {user?.status === UserStatus.ADULT_PENDING && 'Hemos recibido tu solicitud y estamos revisando tu documentación.'}
                {user?.status === UserStatus.ADULT_VERIFIED && 'Tu edad ha sido verificada. Tienes acceso completo a todas las funciones.'}
              </p>
            </div>

            {/* Status-specific information */}
            {user?.status === UserStatus.MINOR && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h3 className="font-bold text-lg mb-3">🚫 Funciones Restringidas (Para Tu Protección)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🗨️</span>
                    <span>No puedes acceder al chat de Telegram de la comunidad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">👨‍👩‍👧‍👦</span>
                    <span>No puedes crear perfiles familiares (solo unirte por invitación de tu padre/madre)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🎭</span>
                    <span>Funciones sociales limitadas para tu protección</span>
                  </li>
                </ul>
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    💡 <strong>¿Ya eres mayor de edad?</strong> Puedes verificar tu edad en cualquier momento usando el formulario de verificación abajo para desbloquear todas las funciones.
                  </p>
                </div>
              </div>
            )}

            {user?.status === UserStatus.ADULT_PENDING && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-3">⏰ Tiempo Estimado de Revisión</h3>
                <p className="text-sm mb-4">
                  Nuestro equipo revisa las solicitudes en un plazo de 24-48 horas hábiles. Te notificaremos por email cuando tu verificación esté completa.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-blue-500 animate-pulse"></div>
                  </div>
                  <span className="font-medium">En progreso...</span>
                </div>
              </div>
            )}

            {user?.status === UserStatus.ADULT_VERIFIED && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h3 className="font-bold text-lg mb-3">🎉 Funciones Desbloqueadas</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>Acceso completo al chat de Telegram</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>Crear y administrar perfiles familiares</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>Todas las funciones sociales disponibles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>Invitar a familiares y crear personajes</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Verification Form - Only show if MINOR */}
          {user?.status === UserStatus.MINOR && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                📄 Verificación de Edad (Solo Mayores de 18 Años)
              </h2>
              <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-4 mb-6">
                <p className="text-sm font-bold text-orange-900 dark:text-orange-100 mb-2">
                  ⚠️ IMPORTANTE: Este proceso es solo para mayores de edad
                </p>
                <p className="text-xs text-orange-800 dark:text-orange-200">
                  Si eres estudiante, NO completes este formulario. Pide a tu padre o madre que verifique tu edad subiendo tu documento de identidad.
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Para desbloquear todas las funciones, necesitamos verificar que eres mayor de edad. Sube una foto de tu documento de identidad (DNI, pasaporte o licencia de conducir).
              </p>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Documento
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="dni">DNI / Cédula de Identidad</option>
                    <option value="passport">Pasaporte</option>
                    <option value="license">Licencia de Conducir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subir Documento (Frente)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <input type="file" className="hidden" id="document-front" accept="image/*" />
                    <label htmlFor="document-front" className="cursor-pointer">
                      <span className="text-4xl block mb-2">📸</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Haz clic para subir o arrastra el archivo aquí
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-500 mt-1">
                        PNG, JPG o PDF (máx. 10MB)
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subir Documento (Reverso) - Opcional
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <input type="file" className="hidden" id="document-back" accept="image/*" />
                    <label htmlFor="document-back" className="cursor-pointer">
                      <span className="text-4xl block mb-2">📸</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Haz clic para subir o arrastra el archivo aquí
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <span>🔒</span>
                    Tu Privacidad es Importante
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Tus documentos se almacenan de forma segura y encriptada</li>
                    <li>• Solo los usamos para verificar tu edad</li>
                    <li>• Serán eliminados automáticamente después de la verificación</li>
                    <li>• Nunca compartimos tu información con terceros</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    Enviar Documentos para Verificación
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>❓</span>
                ¿Por qué verificar mi edad?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                La verificación de edad nos ayuda a crear un entorno seguro y apropiado para todos los usuarios, cumpliendo con regulaciones de protección de menores.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>⏱️</span>
                ¿Cuánto tarda la verificación?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Normalmente procesamos las verificaciones en 24-48 horas hábiles. Te notificaremos por email cuando esté lista.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('subscriptions.title')}
            </h2>

            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {sub.plan}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              sub.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}
                          >
                            {sub.status === 'active'
                              ? t('subscriptions.active')
                              : t('subscriptions.inactive')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('subscriptions.nextPayment')}: {sub.nextPayment}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {sub.price}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                          >
                            {t('subscriptions.manage')}
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            {t('subscriptions.cancel')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">💳</span>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('subscriptions.noSubscriptions')}
                </p>
                <button
                  type="button"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  {t('subscriptions.viewPlans')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('account.changePassword')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.currentPassword')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.newPassword')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.confirmPassword')}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  {t('profile.saveChanges')}
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Preferencias
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.language')}
                </label>
                <select
                  value={locale}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={isPending}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="it">🇮🇹 Italiano</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="pt">🇵🇹 Português</option>
                  <option value="ro">🇷🇴 Română</option>
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="zh">🇨🇳 中文</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  El idioma se actualizará inmediatamente en toda la aplicación
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.timezone')}
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                  <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('account.dateFormat')}
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </select>
              </div>

              {/* Onboarding Tutorial */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tutorial de Inicio
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  ¿Quieres volver a ver el tutorial de inicio? Puedes revivirlo en cualquier momento.
                </p>
                <RestartOnboardingButton />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('notifications.title')}
            </h2>

            <div className="space-y-4">
              {[
                { id: 'email', label: t('notifications.email') },
                { id: 'push', label: t('notifications.push') },
                { id: 'newsletter', label: t('notifications.newsletter') },
                { id: 'treeUpdates', label: t('notifications.treeUpdates') },
                { id: 'marketingEmails', label: t('notifications.marketingEmails') },
                { id: 'productUpdates', label: t('notifications.productUpdates') },
              ].map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <span className="text-gray-900 dark:text-white font-medium">
                    {notification.label}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={['email', 'treeUpdates', 'productUpdates'].includes(
                        notification.id
                      )}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ChocoCoins Tab */}
      {activeTab === 'chococoins' && (
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 mb-2">{t('chococoins.balance')}</p>
                <p className="text-5xl font-bold">120 🪙</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCoinPackages(true)}
                className="px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all shadow-md hover:shadow-lg"
              >
                {t('chococoins.buyMore')}
              </button>
            </div>
          </div>

          {/* ChocoCoin Packages Modal */}
          {showCoinPackages && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => !isProcessingPayment && setShowCoinPackages(false)}
              />

              {/* Modal */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">Comprar ChocoCoins</h2>
                        <p className="text-white/90 text-sm">Elige el paquete perfecto para ti</p>
                      </div>
                      {!isProcessingPayment && (
                        <button
                          onClick={() => setShowCoinPackages(false)}
                          className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                          <span className="text-2xl">✕</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Packages Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chococoinPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`relative border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
                          pkg.popular
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            MÁS POPULAR
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <span className="text-5xl block mb-2">🪙</span>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {pkg.coins}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {pkg.description}
                          </p>
                          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {pkg.price}
                          </p>
                        </div>

                        <button
                          onClick={() => handleBuyCoins(pkg.id)}
                          disabled={isProcessingPayment}
                          className={`w-full py-3 rounded-lg font-bold transition-all ${
                            pkg.popular
                              ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isProcessingPayment ? 'Procesando...' : 'Comprar Ahora'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Info Footer */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 p-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <span>🔒</span>
                      Pago seguro con Stripe
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Pagos procesados de forma segura por Stripe</li>
                      <li>• Aceptamos tarjetas de crédito y débito</li>
                      <li>• Tus ChocoCoins se acreditarán inmediatamente</li>
                      <li>• Política de reembolso de 30 días</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Transaction History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('chococoins.history')}
            </h2>

            {chococoinsTransactions.length > 0 ? (
              <div className="space-y-3">
                {chococoinsTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.type}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.date}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        transaction.amount.startsWith('+')
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.amount} 🪙
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">🪙</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('chococoins.noTransactions')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('privacy.twoFactor')}
            </h2>

            <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {t('privacy.twoFactor')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estado:{' '}
                  <span className="text-red-600 dark:text-red-400">
                    {t('privacy.twoFactorDisabled')}
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all"
              >
                {t('privacy.enable')}
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('privacy.sessions')}
            </h2>

            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💻</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                            {t('privacy.currentSession')}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      type="button"
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      {t('privacy.revokeSession')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2">
              {t('privacy.deleteAccount')}
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {t('privacy.deleteWarning')}
            </p>
            <button
              type="button"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all"
            >
              {t('privacy.confirmDelete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
