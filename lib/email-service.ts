/**
 * Email Service using MailerSend
 * Handles all transactional emails for the Chocosfera platform
 */

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Initialize MailerSend client
const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

// Default sender configuration
const getDefaultSender = (): Sender => {
  return new Sender(
    process.env.MAILERSEND_FROM_EMAIL || 'noreply@chocosfera.com',
    process.env.MAILERSEND_FROM_NAME || 'Chocósfera'
  );
};

// Check if email service is configured
export const isEmailConfigured = (): boolean => {
  return !!(
    process.env.MAILERSEND_API_KEY &&
    process.env.MAILERSEND_FROM_EMAIL
  );
};

/**
 * Email Templates
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate HTML wrapper for emails
 */
const getEmailWrapper = (content: string, locale: string = 'es'): string => {
  const brandName = locale === 'es' ? 'Chocósfera' : 'Chocosphere';

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .brand {
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .content {
      color: #374151;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">🍫</div>
        <div class="brand">${brandName}</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${brandName}. ${locale === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
        <p style="margin-top: 8px; font-size: 12px;">
          ${locale === 'es' ? 'Este es un correo automático, por favor no respondas.' : 'This is an automated email, please do not reply.'}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Email Templates
 */

export const emailTemplates = {
  /**
   * Email Verification Template
   */
  verification: (params: {
    name: string;
    verificationUrl: string;
    locale?: string;
  }): EmailTemplate => {
    const locale = params.locale || 'es';
    const isSpanish = locale === 'es';

    const content = `
      <h2 style="color: #111827; margin-bottom: 16px;">
        ${isSpanish ? '¡Bienvenido/a' : 'Welcome'} ${params.name}! 🎉
      </h2>
      <p>
        ${isSpanish
          ? 'Gracias por unirte a la Chocósfera. Para comenzar tu aventura, necesitamos verificar tu correo electrónico.'
          : 'Thank you for joining Chocosphere. To start your adventure, we need to verify your email address.'}
      </p>
      <p>
        ${isSpanish
          ? 'Haz clic en el botón de abajo para verificar tu cuenta:'
          : 'Click the button below to verify your account:'}
      </p>
      <div style="text-align: center;">
        <a href="${params.verificationUrl}" class="button">
          ${isSpanish ? '✅ Verificar mi cuenta' : '✅ Verify my account'}
        </a>
      </div>
      <div class="divider"></div>
      <p style="font-size: 14px; color: #6b7280;">
        ${isSpanish
          ? 'Si no creaste esta cuenta, puedes ignorar este correo.'
          : 'If you did not create this account, you can safely ignore this email.'}
      </p>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 16px;">
        ${isSpanish
          ? 'O copia y pega esta URL en tu navegador:'
          : 'Or copy and paste this URL into your browser:'}
        <br>
        <a href="${params.verificationUrl}" style="color: #8b5cf6; word-break: break-all;">
          ${params.verificationUrl}
        </a>
      </p>
    `;

    return {
      subject: isSpanish
        ? '🍫 Verifica tu cuenta en Chocósfera'
        : '🍫 Verify your Chocosphere account',
      html: getEmailWrapper(content, locale),
      text: isSpanish
        ? `¡Bienvenido/a ${params.name}!\n\nGracias por unirte a la Chocósfera. Para comenzar tu aventura, verifica tu correo electrónico:\n\n${params.verificationUrl}\n\nSi no creaste esta cuenta, puedes ignorar este correo.`
        : `Welcome ${params.name}!\n\nThank you for joining Chocosphere. To start your adventure, verify your email:\n\n${params.verificationUrl}\n\nIf you did not create this account, you can safely ignore this email.`,
    };
  },

  /**
   * Family Invitation Template
   */
  familyInvitation: (params: {
    inviterName: string;
    familyName: string;
    inviteeEmail: string;
    acceptUrl: string;
    locale?: string;
  }): EmailTemplate => {
    const locale = params.locale || 'es';
    const isSpanish = locale === 'es';

    const content = `
      <h2 style="color: #111827; margin-bottom: 16px;">
        ${isSpanish ? '¡Nueva Invitación Familiar!' : 'New Family Invitation!'} 👨‍👩‍👧‍👦
      </h2>
      <p>
        <strong>${params.inviterName}</strong> ${isSpanish ? 'te ha invitado a unirte a la familia' : 'has invited you to join the family'}
        <strong style="color: #8b5cf6;">${params.familyName}</strong> ${isSpanish ? 'en Chocósfera' : 'on Chocosphere'}.
      </p>
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">
          ${isSpanish ? '¿Qué puedes hacer en una familia?' : 'What can you do in a family?'}
        </p>
        <ul style="color: #92400e; margin: 12px 0 0 0; padding-left: 20px;">
          <li>${isSpanish ? 'Compartir y colaborar en personajes' : 'Share and collaborate on characters'}</li>
          <li>${isSpanish ? 'Ver el progreso de todos los miembros' : 'See the progress of all members'}</li>
          <li>${isSpanish ? 'Trabajar juntos en historias' : 'Work together on stories'}</li>
          <li>${isSpanish ? 'Obtener beneficios familiares' : 'Get family benefits'}</li>
        </ul>
      </div>
      <div style="text-align: center;">
        <a href="${params.acceptUrl}" class="button">
          ${isSpanish ? '✅ Aceptar invitación' : '✅ Accept invitation'}
        </a>
      </div>
      <div class="divider"></div>
      <p style="font-size: 14px; color: #6b7280;">
        ${isSpanish
          ? 'Esta invitación es personal. Si no esperas esta invitación, puedes ignorar este correo.'
          : 'This invitation is personal. If you were not expecting this invitation, you can safely ignore this email.'}
      </p>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 16px;">
        ${isSpanish
          ? 'O copia y pega esta URL en tu navegador:'
          : 'Or copy and paste this URL into your browser:'}
        <br>
        <a href="${params.acceptUrl}" style="color: #8b5cf6; word-break: break-all;">
          ${params.acceptUrl}
        </a>
      </p>
    `;

    return {
      subject: isSpanish
        ? `🍫 ${params.inviterName} te invita a unirte a ${params.familyName}`
        : `🍫 ${params.inviterName} invites you to join ${params.familyName}`,
      html: getEmailWrapper(content, locale),
      text: isSpanish
        ? `${params.inviterName} te ha invitado a unirte a la familia "${params.familyName}" en Chocósfera.\n\nAcepta la invitación aquí:\n${params.acceptUrl}\n\nSi no esperas esta invitación, puedes ignorar este correo.`
        : `${params.inviterName} has invited you to join the family "${params.familyName}" on Chocosphere.\n\nAccept the invitation here:\n${params.acceptUrl}\n\nIf you were not expecting this invitation, you can safely ignore this email.`,
    };
  },

  /**
   * Password Reset Template
   */
  passwordReset: (params: {
    name: string;
    resetUrl: string;
    locale?: string;
  }): EmailTemplate => {
    const locale = params.locale || 'es';
    const isSpanish = locale === 'es';

    const content = `
      <h2 style="color: #111827; margin-bottom: 16px;">
        ${isSpanish ? 'Recuperación de Contraseña' : 'Password Recovery'} 🔐
      </h2>
      <p>
        ${isSpanish ? 'Hola' : 'Hello'} ${params.name},
      </p>
      <p>
        ${isSpanish
          ? 'Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:'
          : 'We received a request to reset your password. Click the button below to create a new password:'}
      </p>
      <div style="text-align: center;">
        <a href="${params.resetUrl}" class="button">
          ${isSpanish ? '🔑 Restablecer contraseña' : '🔑 Reset password'}
        </a>
      </div>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 8px;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">
          ${isSpanish ? '⚠️ Importante:' : '⚠️ Important:'}
        </p>
        <p style="margin: 8px 0 0 0; color: #991b1b; font-size: 14px;">
          ${isSpanish
            ? 'Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este correo y tu contraseña no cambiará.'
            : 'This link will expire in 1 hour. If you did not request this change, ignore this email and your password will remain unchanged.'}
        </p>
      </div>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 16px;">
        ${isSpanish
          ? 'O copia y pega esta URL en tu navegador:'
          : 'Or copy and paste this URL into your browser:'}
        <br>
        <a href="${params.resetUrl}" style="color: #8b5cf6; word-break: break-all;">
          ${params.resetUrl}
        </a>
      </p>
    `;

    return {
      subject: isSpanish
        ? '🔐 Restablece tu contraseña en Chocósfera'
        : '🔐 Reset your Chocosphere password',
      html: getEmailWrapper(content, locale),
      text: isSpanish
        ? `Hola ${params.name},\n\nRecibimos una solicitud para restablecer tu contraseña. Usa este enlace:\n\n${params.resetUrl}\n\nEste enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este correo.`
        : `Hello ${params.name},\n\nWe received a request to reset your password. Use this link:\n\n${params.resetUrl}\n\nThis link will expire in 1 hour. If you did not request this change, ignore this email.`,
    };
  },

  /**
   * Welcome Email Template
   */
  welcome: (params: {
    name: string;
    dashboardUrl: string;
    locale?: string;
  }): EmailTemplate => {
    const locale = params.locale || 'es';
    const isSpanish = locale === 'es';

    const content = `
      <h2 style="color: #111827; margin-bottom: 16px;">
        ${isSpanish ? '¡Bienvenido/a a la Chocósfera!' : 'Welcome to Chocosphere!'} 🎉
      </h2>
      <p>
        ${isSpanish ? 'Hola' : 'Hello'} ${params.name},
      </p>
      <p>
        ${isSpanish
          ? '¡Tu cuenta ha sido verificada exitosamente! Ahora puedes comenzar tu aventura en la Chocósfera.'
          : 'Your account has been successfully verified! You can now start your adventure in Chocosphere.'}
      </p>
      <div style="background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%); border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0; color: #6b21a8; font-weight: 600;">
          ${isSpanish ? '✨ Próximos pasos:' : '✨ Next steps:'}
        </p>
        <ul style="color: #6b21a8; margin: 12px 0 0 0; padding-left: 20px;">
          <li>${isSpanish ? 'Crea tu primer personaje' : 'Create your first character'}</li>
          <li>${isSpanish ? 'Explora el mundo del cacao' : 'Explore the world of cacao'}</li>
          <li>${isSpanish ? 'Invita a tu familia' : 'Invite your family'}</li>
          <li>${isSpanish ? 'Comienza a escribir historias' : 'Start writing stories'}</li>
        </ul>
      </div>
      <div style="text-align: center;">
        <a href="${params.dashboardUrl}" class="button">
          ${isSpanish ? '🚀 Ir al Dashboard' : '🚀 Go to Dashboard'}
        </a>
      </div>
      <div class="divider"></div>
      <p style="font-size: 14px; color: #6b7280;">
        ${isSpanish
          ? '¿Necesitas ayuda? Visita nuestra documentación o contáctanos en cualquier momento.'
          : 'Need help? Visit our documentation or contact us anytime.'}
      </p>
    `;

    return {
      subject: isSpanish
        ? '🍫 ¡Bienvenido/a a la Chocósfera!'
        : '🍫 Welcome to Chocosphere!',
      html: getEmailWrapper(content, locale),
      text: isSpanish
        ? `¡Bienvenido/a ${params.name}!\n\nTu cuenta ha sido verificada exitosamente. Comienza tu aventura aquí:\n\n${params.dashboardUrl}\n\nPróximos pasos:\n- Crea tu primer personaje\n- Explora el mundo del cacao\n- Invita a tu familia\n- Comienza a escribir historias`
        : `Welcome ${params.name}!\n\nYour account has been successfully verified. Start your adventure here:\n\n${params.dashboardUrl}\n\nNext steps:\n- Create your first character\n- Explore the world of cacao\n- Invite your family\n- Start writing stories`,
    };
  },
};

/**
 * Send Email Function
 */
export async function sendEmail(params: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check if email service is configured
  if (!isEmailConfigured()) {
    console.warn('⚠️ Email service not configured. Email not sent to:', params.to);
    console.log('📧 Email preview:');
    console.log('To:', params.to);
    console.log('Subject:', params.subject);
    console.log('Text:', params.text);

    // In development, we just log instead of sending
    if (process.env.NODE_ENV === 'development') {
      return { success: true, messageId: 'dev-mode-no-send' };
    }

    return { success: false, error: 'Email service not configured' };
  }

  try {
    const sentFrom = getDefaultSender();
    const recipients = [new Recipient(params.to, params.toName || params.to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(params.subject)
      .setHtml(params.html)
      .setText(params.text);

    const response = await mailersend.email.send(emailParams);

    console.log('✅ Email sent successfully:', {
      to: params.to,
      subject: params.subject,
    });

    return { success: true, messageId: response.headers?.['x-message-id'] };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper Functions for Common Emails
 */

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  verificationUrl: string;
  locale?: string;
}) {
  const template = emailTemplates.verification({
    name: params.name,
    verificationUrl: params.verificationUrl,
    locale: params.locale,
  });

  return sendEmail({
    to: params.to,
    toName: params.name,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendFamilyInvitationEmail(params: {
  to: string;
  inviterName: string;
  familyName: string;
  acceptUrl: string;
  locale?: string;
}) {
  const template = emailTemplates.familyInvitation({
    inviterName: params.inviterName,
    familyName: params.familyName,
    inviteeEmail: params.to,
    acceptUrl: params.acceptUrl,
    locale: params.locale,
  });

  return sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
  locale?: string;
}) {
  const template = emailTemplates.passwordReset({
    name: params.name,
    resetUrl: params.resetUrl,
    locale: params.locale,
  });

  return sendEmail({
    to: params.to,
    toName: params.name,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  dashboardUrl: string;
  locale?: string;
}) {
  const template = emailTemplates.welcome({
    name: params.name,
    dashboardUrl: params.dashboardUrl,
    locale: params.locale,
  });

  return sendEmail({
    to: params.to,
    toName: params.name,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
