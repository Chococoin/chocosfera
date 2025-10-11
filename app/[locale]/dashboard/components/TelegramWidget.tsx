'use client';

import { useEffect, useRef } from 'react';

interface TelegramWidgetProps {
  // Username del grupo/canal de Telegram (ej: "chocosfera_community")
  channelUsername: string;
  // Color del tema (por defecto usa el color primary de Chocósfera)
  colorScheme?: 'light' | 'dark';
  // Altura del widget
  height?: number;
}

export function TelegramWidget({
  channelUsername,
  colorScheme = 'light',
  height = 600,
}: TelegramWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar el script de Telegram Widget si no está cargado
    const scriptId = 'telegram-widget-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      document.head.appendChild(script);
    }

    // Limpiar el widget anterior si existe
    if (widgetRef.current) {
      widgetRef.current.innerHTML = '';
    }

    // Esperar a que el script se cargue y crear el widget
    const checkTelegramWidget = setInterval(() => {
      if (window.Telegram && window.Telegram.DiscussionButton) {
        clearInterval(checkTelegramWidget);

        if (widgetRef.current) {
          // Crear el widget de discusión
          const widgetElement = document.createElement('script');
          widgetElement.async = true;
          widgetElement.src = 'https://telegram.org/js/telegram-widget.js?22';
          widgetElement.setAttribute('data-telegram-discussion', channelUsername);
          widgetElement.setAttribute('data-comments-limit', '10');
          widgetElement.setAttribute('data-colorful', '1');
          widgetElement.setAttribute('data-color', 'EC7813'); // Color primary de Chocósfera
          widgetElement.setAttribute('data-dark-color', 'F97316'); // Color naranja oscuro
          widgetElement.setAttribute('data-color-scheme', colorScheme);

          widgetRef.current.appendChild(widgetElement);
        }
      }
    }, 100);

    return () => {
      clearInterval(checkTelegramWidget);
    };
  }, [channelUsername, colorScheme]);

  return (
    <div className="w-full">
      <div
        ref={widgetRef}
        className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        style={{ minHeight: `${height}px` }}
      />
    </div>
  );
}

// Declaración de tipos para window.Telegram
declare global {
  interface Window {
    Telegram?: {
      DiscussionButton?: unknown;
      Login?: unknown;
    };
  }
}
