'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserStatus } from '@prisma/client';
import { RestartOnboardingButton } from '@/components/Onboarding';

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const { user, isMinor } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Mock data - en producción vendría de una API
  const userProfile = {
    name: 'María García',
    email: 'maria@example.com',
    username: 'maria_choco',
    avatar: '👤',
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

      {/* Verification Alert Banner - Show if user is MINOR */}
      {user && isMinor && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">👶</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                Cuenta de Menor de Edad
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                Tu cuenta está registrada como menor de edad. Algunas funciones están restringidas, incluyendo el acceso al chat de Telegram de la comunidad.
              </p>
              <button
                onClick={() => setActiveTab('verification')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <span>✅</span>
                Verificar Mi Edad Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('profile.title')}
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center text-5xl">
                {userProfile.avatar}
              </div>
              <div>
                <button
                  type="button"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all mb-2"
                >
                  {t('profile.changeAvatar')}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG o GIF. Máximo 2MB.
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.name')}
                </label>
                <input
                  type="text"
                  defaultValue={userProfile.name}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.email')}
                </label>
                <input
                  type="email"
                  defaultValue={userProfile.email}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.username')}
                </label>
                <input
                  type="text"
                  defaultValue={userProfile.username}
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
                {user?.status === UserStatus.MINOR ? '👶' : user?.status === UserStatus.ADULT_PENDING ? '⏳' : '✅'}
              </span>
              <h2 className="text-2xl font-bold mb-2" style={{
                color: user?.status === UserStatus.MINOR
                  ? 'var(--tw-prose-bold)'
                  : user?.status === UserStatus.ADULT_PENDING
                  ? 'var(--tw-prose-bold)'
                  : 'var(--tw-prose-bold)'
              }}>
                Estado de Verificación:{' '}
                {user?.status === UserStatus.MINOR && 'Menor de Edad'}
                {user?.status === UserStatus.ADULT_PENDING && 'Verificación Pendiente'}
                {user?.status === UserStatus.ADULT_VERIFIED && 'Adulto Verificado'}
              </h2>
              <p className="text-sm opacity-90">
                {user?.status === UserStatus.MINOR && 'Tu cuenta está registrada como menor de edad con funciones restringidas.'}
                {user?.status === UserStatus.ADULT_PENDING && 'Hemos recibido tu solicitud y estamos revisando tu documentación.'}
                {user?.status === UserStatus.ADULT_VERIFIED && 'Tu edad ha sido verificada. Tienes acceso completo a todas las funciones.'}
              </p>
            </div>

            {/* Status-specific information */}
            {user?.status === UserStatus.MINOR && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h3 className="font-bold text-lg mb-3">🚫 Funciones Restringidas</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🗨️</span>
                    <span>No puedes acceder al chat de Telegram de la comunidad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">👨‍👩‍👧‍👦</span>
                    <span>No puedes crear perfiles familiares (solo unirte por invitación)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🎭</span>
                    <span>Funciones sociales limitadas para tu protección</span>
                  </li>
                </ul>
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
                📄 Verificar Mi Edad
              </h2>
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
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="it">Italiano</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
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
                className="px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all"
              >
                {t('chococoins.buyMore')}
              </button>
            </div>
          </div>

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
