'use client';

/**
 * Onboarding Component
 * Interactive tutorial for new users
 */

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  targetPath?: string;
  action?: {
    label: string;
    href: string;
  };
}

const onboardingSteps: Record<string, OnboardingStep[]> = {
  es: [
    {
      title: '¡Bienvenido a Chocósfera!',
      description: 'Chocósfera es tu espacio para crear y compartir personajes únicos de cacao. Vamos a hacer un recorrido rápido para que conozcas las funciones principales.',
      icon: '🍫',
    },
    {
      title: 'Crea tu primer personaje',
      description: 'Los personajes son el corazón de Chocósfera. Puedes crear cacaos, chocolates, agricultores y más. Cada personaje tiene su propia personalidad, habilidades y lema.',
      icon: '🎭',
      targetPath: '/dashboard',
      action: {
        label: 'Crear Personaje',
        href: '/dashboard/characters/create',
      },
    },
    {
      title: 'Escribe historias épicas',
      description: 'Dale vida a tus personajes escribiendo historias. Usa Markdown para formatear y comparte tus creaciones con la comunidad.',
      icon: '📚',
      targetPath: '/dashboard',
    },
    {
      title: 'Explora la comunidad',
      description: 'Descubre personajes e historias de otros usuarios. Dale like a tus favoritos y crea forks para hacer tus propias versiones.',
      icon: '🔍',
      targetPath: '/dashboard',
      action: {
        label: 'Explorar',
        href: '/dashboard/explore',
      },
    },
    {
      title: 'Invita a tu familia',
      description: 'Crea una familia y comparte personajes privados con tus seres queridos. Es perfecto para proyectos colaborativos.',
      icon: '👨‍👩‍👧‍👦',
      targetPath: '/dashboard',
      action: {
        label: 'Mi Familia',
        href: '/dashboard/family',
      },
    },
    {
      title: '¡Listo para empezar!',
      description: 'Ya conoces lo básico. Ahora es tu turno de crear algo increíble. Si necesitas ayuda, recuerda que puedes volver a ver este tutorial desde tu perfil.',
      icon: '🚀',
    },
  ],
  en: [
    {
      title: 'Welcome to Chocósfera!',
      description: 'Chocósfera is your space to create and share unique cacao characters. Let\'s take a quick tour to show you the main features.',
      icon: '🍫',
    },
    {
      title: 'Create your first character',
      description: 'Characters are the heart of Chocósfera. You can create cacaos, chocolates, farmers, and more. Each character has their own personality, abilities, and motto.',
      icon: '🎭',
      targetPath: '/dashboard',
      action: {
        label: 'Create Character',
        href: '/dashboard/characters/create',
      },
    },
    {
      title: 'Write epic stories',
      description: 'Bring your characters to life by writing stories. Use Markdown for formatting and share your creations with the community.',
      icon: '📚',
      targetPath: '/dashboard',
    },
    {
      title: 'Explore the community',
      description: 'Discover characters and stories from other users. Like your favorites and create forks to make your own versions.',
      icon: '🔍',
      targetPath: '/dashboard',
      action: {
        label: 'Explore',
        href: '/dashboard/explore',
      },
    },
    {
      title: 'Invite your family',
      description: 'Create a family and share private characters with your loved ones. It\'s perfect for collaborative projects.',
      icon: '👨‍👩‍👧‍👦',
      targetPath: '/dashboard',
      action: {
        label: 'My Family',
        href: '/dashboard/family',
      },
    },
    {
      title: 'Ready to start!',
      description: 'You now know the basics. Now it\'s your turn to create something amazing. If you need help, remember you can revisit this tutorial from your profile.',
      icon: '🚀',
    },
  ],
  it: [
    {
      title: 'Benvenuto su Chocósfera!',
      description: 'Chocósfera è il tuo spazio per creare e condividere personaggi unici di cacao. Facciamo un rapido tour per mostrarti le funzionalità principali.',
      icon: '🍫',
    },
    {
      title: 'Crea il tuo primo personaggio',
      description: 'I personaggi sono il cuore di Chocósfera. Puoi creare cacao, cioccolatini, agricoltori e altro. Ogni personaggio ha la propria personalità, abilità e motto.',
      icon: '🎭',
      targetPath: '/dashboard',
      action: {
        label: 'Crea Personaggio',
        href: '/dashboard/characters/create',
      },
    },
    {
      title: 'Scrivi storie epiche',
      description: 'Dai vita ai tuoi personaggi scrivendo storie. Usa Markdown per la formattazione e condividi le tue creazioni con la community.',
      icon: '📚',
      targetPath: '/dashboard',
    },
    {
      title: 'Esplora la community',
      description: 'Scopri personaggi e storie di altri utenti. Metti mi piace ai tuoi preferiti e crea fork per fare le tue versioni.',
      icon: '🔍',
      targetPath: '/dashboard',
      action: {
        label: 'Esplora',
        href: '/dashboard/explore',
      },
    },
    {
      title: 'Invita la tua famiglia',
      description: 'Crea una famiglia e condividi personaggi privati con i tuoi cari. È perfetto per progetti collaborativi.',
      icon: '👨‍👩‍👧‍👦',
      targetPath: '/dashboard',
      action: {
        label: 'La Mia Famiglia',
        href: '/dashboard/family',
      },
    },
    {
      title: 'Pronto per iniziare!',
      description: 'Ora conosci le basi. Ora è il tuo turno di creare qualcosa di incredibile. Se hai bisogno di aiuto, ricorda che puoi rivedere questo tutorial dal tuo profilo.',
      icon: '🚀',
    },
  ],
};

interface OnboardingProps {
  onComplete?: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as 'es' | 'en' | 'it';
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = onboardingSteps[locale] || onboardingSteps.es;

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem('chocosfera-onboarding-completed');
    if (!completed) {
      // Show onboarding after a short delay
      setTimeout(() => {
        setIsOpen(true);
      }, 1000);
    } else {
      setIsCompleted(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('chocosfera-onboarding-completed', 'true');
    setIsCompleted(true);
    setIsOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleAction = (href: string) => {
    handleComplete();
    router.push(`/${locale}${href}`);
  };

  if (!isOpen || isCompleted) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fadeIn">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="text-center mb-6">
            <span className="text-8xl inline-block animate-bounce">{step.icon}</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-center mb-8">
            {step.description}
          </p>

          {/* Action Button */}
          {step.action && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => handleAction(step.action!.href)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                {step.action.label} →
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSkip}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-semibold transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Cerrar' : 'Saltar tutorial'}
            </button>

            <div className="flex items-center gap-2">
              {/* Step Indicators */}
              <div className="flex gap-2 mr-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-gradient-to-r from-purple-600 to-pink-600'
                        : index < currentStep
                        ? 'w-2 bg-purple-300 dark:bg-purple-700'
                        : 'w-2 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    ← Anterior
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  {currentStep === steps.length - 1 ? '¡Empezar! 🚀' : 'Siguiente →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Button to restart onboarding from settings/profile
 */
export function RestartOnboardingButton() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleRestart = () => {
    localStorage.removeItem('chocosfera-onboarding-completed');
    setShowOnboarding(true);
    // Reload to trigger onboarding
    window.location.reload();
  };

  return (
    <button
      onClick={handleRestart}
      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
    >
      <span>🎓</span>
      <span>Ver tutorial de nuevo</span>
    </button>
  );
}
