# Sistema de Emails Transaccionales - MailerSend

## Descripción General

El sistema de emails transaccionales de Chocósfera utiliza **MailerSend** para enviar notificaciones automáticas a los usuarios. Este documento describe la configuración, uso e integración del sistema de emails.

**Fecha**: 14 de Octubre, 2025
**Estado**: ✅ Implementado (v1.0)

---

## 📋 Índice

1. [Configuración](#configuración)
2. [Arquitectura](#arquitectura)
3. [Templates Disponibles](#templates-disponibles)
4. [Uso del Servicio](#uso-del-servicio)
5. [Integración](#integración)
6. [Desarrollo y Testing](#desarrollo-y-testing)
7. [Troubleshooting](#troubleshooting)
8. [Roadmap](#roadmap)

---

## Configuración

### 1. Obtener API Key de MailerSend

1. Crear cuenta en [MailerSend](https://www.mailersend.com/)
2. Verificar tu dominio en la sección "Domains"
3. Generar API key en "API Tokens"
4. Copiar el token generado

### 2. Variables de Entorno

Agregar las siguientes variables al archivo `.env.local`:

```bash
# MailerSend Configuration
MAILERSEND_API_KEY="your-mailersend-api-key-here"
MAILERSEND_FROM_EMAIL="noreply@chocosfera.com"
MAILERSEND_FROM_NAME="Chocósfera"
```

**Descripción de variables**:

- `MAILERSEND_API_KEY`: Token de autenticación de MailerSend (requerido)
- `MAILERSEND_FROM_EMAIL`: Email del remitente (debe estar verificado en MailerSend)
- `MAILERSEND_FROM_NAME`: Nombre que aparecerá como remitente

### 3. Verificación de Dominio

Para enviar emails desde tu dominio personalizado:

1. Ir a MailerSend Dashboard → Domains
2. Agregar tu dominio (ej: `chocosfera.com`)
3. Configurar registros DNS:
   - **SPF**: `v=spf1 include:_spf.mailersend.net ~all`
   - **DKIM**: Agregar registro TXT proporcionado por MailerSend
   - **DMARC**: `v=DMARC1; p=none; rua=mailto:dmarc@chocosfera.com`
4. Esperar verificación (usualmente 24-48 horas)

---

## Arquitectura

### Estructura del Sistema

```
lib/email-service.ts          # Servicio principal de emails
├── MailerSend Client          # Cliente configurado
├── Email Templates            # Templates HTML/Text
├── Helper Functions           # Funciones de envío
└── Configuration              # Validación y configuración

API Integration
├── /api/auth/register         # Email de bienvenida
├── /api/family/invite         # Email de invitación familiar
└── [futuro] Otros endpoints   # Más integraciones
```

### Flujo de Envío

```
Evento del Usuario
    ↓
API Endpoint Triggered
    ↓
Construir Template de Email
    ↓
Llamar a email-service
    ↓
Verificar configuración
    ↓
¿Configurado?
    ├─ SÍ → Enviar via MailerSend
    │         ↓
    │     Log success/error
    │         ↓
    │     Return response
    │
    └─ NO  → Log warning
              ↓
          Modo desarrollo: Log to console
          Modo producción: Return error
```

---

## Templates Disponibles

### 1. Email de Bienvenida (`welcome`)

**Cuándo se envía**: Al registrarse un nuevo usuario
**Idiomas**: ES, EN, IT
**Contenido**:
- Mensaje de bienvenida personalizado
- Próximos pasos sugeridos
- Botón CTA al dashboard
- Información de soporte

**Ejemplo de uso**:
```typescript
import { sendWelcomeEmail } from '@/lib/email-service';

await sendWelcomeEmail({
  to: 'user@example.com',
  name: 'María',
  dashboardUrl: 'https://chocosfera.com/es/dashboard',
  locale: 'es',
});
```

**Vista previa**:
- ✅ Diseño responsive
- 🍫 Branding de Chocósfera
- 🎨 Gradientes purple-pink
- 📱 Mobile-friendly

---

### 2. Email de Invitación Familiar (`familyInvitation`)

**Cuándo se envía**: Al invitar a un familiar a unirse
**Idiomas**: ES, EN, IT
**Contenido**:
- Nombre del invitador
- Nombre de la familia
- Beneficios de unirse
- Botón CTA para aceptar invitación
- Link alternativo

**Ejemplo de uso**:
```typescript
import { sendFamilyInvitationEmail } from '@/lib/email-service';

await sendFamilyInvitationEmail({
  to: 'familiar@example.com',
  inviterName: 'Pedro García',
  familyName: 'Familia García',
  acceptUrl: 'https://chocosfera.com/es/family/accept/abc123',
  locale: 'es',
});
```

**Vista previa**:
- 👨‍👩‍👧‍👦 Temática familiar
- 📋 Lista de beneficios
- ⚠️ Nota de seguridad
- 🔗 URL alternativa

---

### 3. Email de Verificación (`verification`)

**Cuándo se envía**: Al solicitar verificación de email
**Idiomas**: ES, EN, IT
**Contenido**:
- Mensaje de bienvenida
- Instrucciones de verificación
- Botón CTA de verificación
- Nota de seguridad
- Link alternativo

**Ejemplo de uso**:
```typescript
import { sendVerificationEmail } from '@/lib/email-service';

await sendVerificationEmail({
  to: 'user@example.com',
  name: 'Juan',
  verificationUrl: 'https://chocosfera.com/verify/xyz789',
  locale: 'es',
});
```

---

### 4. Email de Recuperación de Contraseña (`passwordReset`)

**Cuándo se envía**: Al solicitar reset de contraseña
**Idiomas**: ES, EN, IT
**Contenido**:
- Confirmación de solicitud
- Botón CTA de reset
- Alerta de expiración (1 hora)
- Nota de seguridad
- Link alternativo

**Ejemplo de uso**:
```typescript
import { sendPasswordResetEmail } from '@/lib/email-service';

await sendPasswordResetEmail({
  to: 'user@example.com',
  name: 'Ana',
  resetUrl: 'https://chocosfera.com/reset-password/token123',
  locale: 'es',
});
```

---

## Uso del Servicio

### Funciones Disponibles

#### `isEmailConfigured()`

Verifica si el servicio de email está configurado correctamente.

```typescript
import { isEmailConfigured } from '@/lib/email-service';

if (isEmailConfigured()) {
  console.log('✅ Email service ready');
} else {
  console.log('⚠️ Email service not configured');
}
```

**Returns**: `boolean`

---

#### `sendEmail(params)`

Función genérica para enviar emails.

```typescript
import { sendEmail } from '@/lib/email-service';

const result = await sendEmail({
  to: 'recipient@example.com',
  toName: 'Recipient Name', // opcional
  subject: 'Subject Line',
  html: '<h1>HTML Content</h1>',
  text: 'Plain text fallback',
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

**Parameters**:
- `to` (string, required): Email del destinatario
- `toName` (string, optional): Nombre del destinatario
- `subject` (string, required): Asunto del email
- `html` (string, required): Contenido HTML
- `text` (string, required): Contenido texto plano

**Returns**: `Promise<{ success: boolean; messageId?: string; error?: string }>`

---

#### Helper Functions

Todas las helper functions siguen el mismo patrón:

```typescript
// Welcome Email
sendWelcomeEmail({ to, name, dashboardUrl, locale? })

// Family Invitation
sendFamilyInvitationEmail({ to, inviterName, familyName, acceptUrl, locale? })

// Verification
sendVerificationEmail({ to, name, verificationUrl, locale? })

// Password Reset
sendPasswordResetEmail({ to, name, resetUrl, locale? })
```

**Todos retornan**: `Promise<{ success: boolean; messageId?: string; error?: string }>`

---

## Integración

### En API Routes

```typescript
// app/api/auth/register/route.ts
import { sendWelcomeEmail } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  // ... crear usuario ...

  // Enviar email (async, no bloquea la respuesta)
  sendWelcomeEmail({
    to: user.email,
    name: user.nick,
    dashboardUrl: `${APP_URL}/${user.locale}/dashboard`,
    locale: user.locale,
  }).catch((error) => {
    console.error('Failed to send welcome email:', error);
    // No falla el registro si el email falla
  });

  return NextResponse.json({ success: true });
}
```

**Patrón recomendado**:
1. ✅ No `await` el email (fire and forget)
2. ✅ Usar `.catch()` para manejar errores
3. ✅ No fallar la operación principal si el email falla
4. ✅ Loggear errores para debugging

---

### En Server Components

```typescript
// app/[locale]/some-page/page.tsx
import { sendEmail } from '@/lib/email-service';

async function handleAction() {
  'use server';

  const result = await sendEmail({
    to: 'user@example.com',
    subject: 'Test Email',
    html: '<p>Content</p>',
    text: 'Content',
  });

  if (!result.success) {
    throw new Error('Failed to send email');
  }
}
```

---

## Desarrollo y Testing

### Modo Desarrollo

Cuando `MAILERSEND_API_KEY` no está configurado:

```typescript
// En desarrollo, los emails se loggean en consola
// ⚠️ Email service not configured. Email not sent to: user@example.com
// 📧 Email preview:
// To: user@example.com
// Subject: Bienvenido a Chocósfera
// Text: [contenido del email]
```

**Ventajas**:
- ✅ No requiere configuración para desarrollo local
- ✅ Puedes ver el contenido de los emails
- ✅ No gasta cuota de MailerSend

---

### Testing Manual

1. **Configurar MailerSend en local**:
   ```bash
   # Agregar API key real
   MAILERSEND_API_KEY="mlsn.xxxxx"
   MAILERSEND_FROM_EMAIL="noreply@tudominio.com"
   ```

2. **Registrar usuario de prueba**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"nick":"test","email":"tu-email@gmail.com","password":"Test1234"}'
   ```

3. **Verificar email recibido**

---

### Testing con Mailtrap

Para staging/QA, se puede usar Mailtrap:

1. Crear cuenta en [Mailtrap.io](https://mailtrap.io/)
2. Obtener credenciales SMTP
3. Configurar MailerSend con SMTP de Mailtrap

---

## Troubleshooting

### Email no se envía

**Síntoma**: El email no llega al destinatario

**Posibles causas**:

1. **API Key no configurada**
   ```
   Verificar: console muestra "Email service not configured"
   Solución: Configurar MAILERSEND_API_KEY en .env.local
   ```

2. **Dominio no verificado**
   ```
   Error en logs: "Domain not verified"
   Solución: Verificar dominio en MailerSend Dashboard
   ```

3. **Email en spam**
   ```
   El email se envía pero llega a spam
   Solución:
   - Verificar registros SPF/DKIM
   - Agregar DMARC policy
   - Hacer warm-up del dominio
   ```

4. **Límite de envío alcanzado**
   ```
   Error: "Rate limit exceeded"
   Solución: Esperar o upgradear plan de MailerSend
   ```

---

### Email se envía pero contenido incorrecto

**Síntoma**: El email llega pero con contenido vacío o mal formateado

**Solución**:
1. Verificar parámetros del template
2. Revisar logs de desarrollo
3. Testear con HTML/text plano directamente

---

### Email tarda mucho en llegar

**Síntoma**: Email se envía exitosamente pero tarda 5+ minutos

**Causas comunes**:
- Delay en servidor SMTP
- Filtros anti-spam del destinatario
- Congestión de red

**Solución**:
- Normalmente se resuelve solo
- Si persiste, contactar soporte de MailerSend

---

## Roadmap

### Fase 1: Emails Básicos (✅ Completado)

- [x] Welcome Email
- [x] Family Invitation
- [x] Email Verification
- [x] Password Reset
- [x] Configuración de MailerSend
- [x] Templates HTML responsivos
- [x] Soporte multi-idioma (ES, EN, IT)

### Fase 2: Emails de Personajes (Próximo)

- [ ] **Notificación de PR**
  - Alguien creó un PR en tu personaje
  - Incluye preview del cambio
  - Botón para revisar en app

- [ ] **PR Aceptado/Rechazado**
  - Notifica al contributor
  - Muestra razón de rechazo (si aplica)
  - Link al personaje actualizado

- [ ] **Nuevo Fork**
  - Alguien hizo fork de tu personaje
  - Muestra quién y link al fork
  - Estadísticas de popularidad

- [ ] **Nuevos Comentarios**
  - Comentarios en tu personaje
  - Preview del comentario
  - Botón para responder

### Fase 3: Emails Comerciales

- [ ] **Confirmación de Compra**
  - Receipt de Stripe
  - Detalles del producto
  - Link para descargar

- [ ] **Confirmación de Suscripción**
  - Welcome a plan premium
  - Beneficios desbloqueados
  - Próxima fecha de cobro

- [ ] **Pago Fallido**
  - Alerta de pago rechazado
  - Instrucciones para actualizar pago
  - Grace period

- [ ] **Cancelación de Suscripción**
  - Confirmación de cancelación
  - Fecha de fin de acceso
  - Encuesta de feedback

### Fase 4: Emails de Engagement

- [ ] **Digest Semanal**
  - Resumen de actividad
  - Nuevos personajes populares
  - Sugerencias personalizadas

- [ ] **Logros Desbloqueados**
  - Badges obtenidos
  - Milestone alcanzado
  - Incentivo para continuar

- [ ] **Recordatorios**
  - Personaje sin actualizar por 30 días
  - Invitación pendiente
  - PR pendiente de review

### Fase 5: Mejoras Avanzadas

- [ ] **Template Builder**
  - Editor visual de templates
  - Preview en tiempo real
  - Variantes A/B testing

- [ ] **Analytics de Emails**
  - Open rate
  - Click-through rate
  - Bounce rate
  - Unsubscribe rate

- [ ] **Personalización Avanzada**
  - Segmentación de usuarios
  - Templates dinámicos
  - Recomendaciones ML

- [ ] **Automatización**
  - Drip campaigns
  - Onboarding sequences
  - Re-engagement flows

---

## Mejores Prácticas

### 1. No Bloquear Operaciones Críticas

```typescript
// ❌ MAL - Bloquea el registro
await sendWelcomeEmail({ ... });
return response;

// ✅ BIEN - Fire and forget
sendWelcomeEmail({ ... }).catch(console.error);
return response;
```

### 2. Manejar Errores Gracefully

```typescript
// ✅ BIEN
sendEmail({ ... })
  .then(result => {
    if (result.success) {
      console.log('Email sent:', result.messageId);
    } else {
      console.error('Email failed:', result.error);
    }
  })
  .catch(error => {
    // Error de conexión, timeout, etc.
    console.error('Email exception:', error);
  });
```

### 3. Respetar Preferencias del Usuario

```typescript
// Verificar preferencias antes de enviar
if (user.emailNotifications) {
  await sendEmail({ ... });
}
```

### 4. Testing

```typescript
// En tests, mockear el servicio
jest.mock('@/lib/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));
```

### 5. Logging

```typescript
// Loggear siempre success y failures
if (result.success) {
  console.log(`✅ Email sent to ${to}:`, result.messageId);
} else {
  console.error(`❌ Failed to send email to ${to}:`, result.error);
}
```

---

## Recursos

- **MailerSend Docs**: https://developers.mailersend.com/
- **MailerSend Dashboard**: https://www.mailersend.com/
- **API Reference**: https://developers.mailersend.com/api/v1/
- **SDK Node.js**: https://github.com/mailersend/mailersend-nodejs

---

## Contacto y Soporte

**Para issues técnicos**:
- Crear issue en GitHub repo
- Etiquetar con `email-service`

**Para configuración de MailerSend**:
- Soporte oficial: support@mailersend.com
- Documentación: https://www.mailersend.com/help

---

**Última actualización**: 14 de Octubre, 2025
**Versión**: 1.0.0
**Estado**: ✅ Producción Ready
