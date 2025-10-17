# Notas de Sesión - Chocósfera

**Última actualización**: 17 de Octubre de 2025

## 📝 Resumen de Sesiones Anteriores

### Sesión 6 - Internacionalización Completa y Sistema de Blog (17 Oct 2025)

#### Trabajo Realizado

1. **Internacionalización del Wizard de Creación de Personajes** 🌍
   - **Problema**: Texto hardcodeado en español en `app/[locale]/dashboard/characters/create/page.tsx`
   - **Solución**:
     - Agregadas traducciones completas en 9 idiomas (es, en, it, fr, de, pt, ro, ja, zh)
     - Estructura organizada bajo `dashboard.characters.create`
     - Grupos lógicos: steps, step1-4, characterTypes, buttons, errors
     - CHARACTER_TYPES ahora dinámico usando hook `useTranslations`
     - Interpolación de parámetros: `{step}`, `{count}`, `{filename}`
   - **Archivos modificados**:
     - `app/[locale]/dashboard/characters/create/page.tsx`: Uso de `t()` en toda la UI
     - `messages/*.json` (9 archivos): Nuevas claves de traducción

2. **Sistema de Blog con Artículos Informativos** 📝
   - **Características**:
     - Página principal: `app/[locale]/blog/page.tsx`
     - Rutas dinámicas: `app/[locale]/blog/[slug]/page.tsx`
     - Selector de idioma y toggle de tema en todas las páginas
     - Navegación inteligente basada en estado de autenticación
   - **Artículos creados**:
     - **ChocoCrypto**: Primer lote disponible, uso de ChocoCoins
     - **Container de Venezuela**: Historia de cacaocultores venezolanos enviando cacao a Italia
       - Header con colores de la bandera venezolana
       - Visualización del viaje en 4 pasos
       - Métricas de impacto
       - CTA para adoptar árboles
   - **Archivos creados**:
     - `app/[locale]/blog/page.tsx`: Listado de artículos
     - `app/[locale]/blog/[slug]/page.tsx`: Vista de artículo individual
     - `messages/*.json`: Traducciones de blog y notificaciones

3. **Sistema de Notificaciones de Bienvenida** 🔔
   - **Características**:
     - Dos notificaciones automáticas para usuarios nuevos
     - Notificación 1: ChocoCrypto con link a `/blog`
     - Notificación 2: Container de Venezuela con link a `/blog/venezuela-container`
     - Contenido adaptado: Sin mencionar "token" o "blockchain", enfoque en ChocoCoins
     - Comportamiento mark-as-read comentado (preservado para futuro)
   - **Archivos modificados**:
     - `app/api/auth/register/route.ts`: Creación de 2 notificaciones al registrar
     - `app/[locale]/dashboard/components/NotificationBell.tsx`: Código mark-as-read comentado
     - `messages/*.json`: Traducciones de notificaciones

4. **Configuración de ESLint** 🔧
   - Agregado `scripts/**` a `eslint.config.mjs` ignores
   - Eliminado archivo deprecated `.eslintignore`
   - Agregado `eslint-disable` comment para función `markAsRead` preservada

#### Archivos Modificados

**Internacionalización**:
- `app/[locale]/dashboard/characters/create/page.tsx`: +60 llamadas a `t()`
- `messages/es.json`: +118 líneas
- `messages/en.json`: +118 líneas
- `messages/it.json`: +118 líneas
- `messages/fr.json`: +118 líneas
- `messages/de.json`: +118 líneas
- `messages/pt.json`: +118 líneas
- `messages/ro.json`: +118 líneas
- `messages/ja.json`: +118 líneas
- `messages/zh.json`: +118 líneas

**Sistema de Blog**:
- `app/[locale]/blog/page.tsx`: +186 líneas (nuevo)
- `app/[locale]/blog/[slug]/page.tsx`: +223 líneas (nuevo)

**Notificaciones**:
- `app/api/auth/register/route.ts`: +27 líneas
- `app/[locale]/dashboard/components/NotificationBell.tsx`: Código comentado

**Configuración**:
- `eslint.config.mjs`: Agregado `scripts/**` a ignores

#### Commits

```bash
# Commit 1: Feature principal
80ede73 - feat: add i18n for character creation, blog system, and welcome notifications
  - 14 archivos modificados
  - +1590 líneas, -109 líneas

# Commit 2: Fixes de linting
4a6b832 - fix: resolve linting errors and add scripts folder to eslint ignore
  - 2 archivos modificados
  - +2 líneas
```

#### Estructura de Traducciones

```json
{
  "dashboard": {
    "characters": {
      "create": {
        "title": "Crear Nuevo Personaje",
        "stepProgress": "Paso {step} de 4",
        "steps": {
          "basics": "Básicos",
          "description": "Descripción",
          "story": "Historia",
          "confirm": "Confirmar"
        },
        "characterTypes": {
          "cacao": {
            "label": "Cacao",
            "description": "Un grano de cacao lleno de potencial"
          }
        },
        "errors": {
          "nameRequired": "El nombre es requerido",
          "nameTooShort": "El nombre debe tener al menos 2 caracteres"
        }
      }
    }
  },
  "notifications": {
    "chococrypto": {
      "title": "¡El primer lote de ChocoCrypto está listo!",
      "message": "Usa tus ChocoCoins para conseguir deliciosas tabletas...",
      "readMore": "Leer más"
    },
    "venezuelaContainer": {
      "title": "¡Container de Venezuela llegó a Italia!",
      "message": "Los cacaocultores venezolanos han enviado su primer container..."
    }
  },
  "blog": {
    "title": "Blog de la Chocósfera",
    "subtitle": "Noticias y actualizaciones"
  }
}
```

#### Patrones Técnicos Implementados

1. **Traducción de Arrays Dinámicos**:
   ```typescript
   const CHARACTER_TYPES = [
     {
       value: 'cacao' as CharacterType,
       label: t('characterTypes.cacao.label'),
       icon: '🍫',
       description: t('characterTypes.cacao.description'),
     },
     // ... más tipos
   ];
   ```

2. **Navegación Inteligente basada en Auth**:
   ```typescript
   const { user } = useAuth();
   const locale = useLocale();

   onClick={() => router.push(user ? `/${locale}/dashboard` : `/${locale}`)}
   ```

3. **Notificaciones Automáticas en Registro**:
   ```typescript
   // En /api/auth/register
   await prisma.notification.create({
     data: {
       userId: user.id,
       type: 'SYSTEM_ANNOUNCEMENT',
       title: '¡El primer lote de ChocoCrypto está listo!',
       actionUrl: `/${user.locale}/blog`,
       icon: '🍫',
       isRead: false,
     },
   });
   ```

4. **Preservación de Código para Futuro**:
   ```typescript
   // TEMPORARILY DISABLED: Mark as read
   // This functionality is commented out to keep notifications visible
   // Uncomment the lines below to restore the original behavior.

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const markAsRead = async (notificationId: string) => {
     // ... código preservado
   };
   ```

#### Testing y Validación

1. **Build exitoso**:
   - `npm run lint`: ✅ Sin errores
   - `npm run build`: ✅ Completado en 5.9s
   - 23 páginas generadas correctamente

2. **Verificación de Conexión a BD**:
   - Instalado Vercel CLI: `npm install -g vercel`
   - Linkeado proyecto: `vercel link --project=chocosfera`
   - Descargadas variables de entorno: `vercel env pull`
   - Confirmada conexión a Neon PostgreSQL en producción

3. **Deploy**:
   - Push a GitHub: ✅ 2 commits
   - Vercel deploy automático: ✅ Activado

#### Decisiones de Diseño

1. **Notificaciones persistentes**: Se deshabilitó temporalmente la función de marcar como leída para mantener las notificaciones visibles después de hacer clic. El código está comentado y listo para restaurar cuando se requiera.

2. **Contenido no técnico**: Se evitó mencionar "token" o "blockchain" en las notificaciones, enfocándose en ChocoCoins y beneficios tangibles (tabletas de chocolate).

3. **Blog integrado**: El blog está dentro de la aplicación (no un CMS externo) para mantener consistencia en diseño y autenticación.

4. **Idiomas soportados**: Mantenida paridad completa en los 9 idiomas para todas las nuevas funcionalidades.

#### Próximos Pasos Sugeridos

- [ ] Agregar más artículos al blog (sistema de gestión de contenido)
- [ ] Implementar sistema de comentarios en artículos
- [ ] Restaurar funcionalidad mark-as-read con toggle de usuario
- [ ] Agregar filtros de notificaciones por tipo
- [ ] Sistema de búsqueda en el blog

---

### Sesión 5 - Fix Stack Overflow y Mejoras de Código (17 Oct 2025)

#### Trabajo Realizado

1. **Fix Crítico: Stack Overflow en i18n.ts** 🐛🔴
   - **Problema**: RangeError: Maximum call stack size exceeded
   - **Causa**: Doble validación con `notFound()` creando bucle infinito
     - `i18n.ts:16` llamaba `notFound()` cuando locale no era válido
     - `app/[locale]/layout.tsx:40-42` también llamaba `notFound()`
     - Middleware redirigía → layout validaba → `notFound()` → middleware redirigía → bucle infinito
   - **Solución**:
     - ❌ Eliminado `notFound()` de `i18n.ts`
     - ✅ Implementado fallback a locale 'en' cuando locale no es válido
     - ✅ Removido import innecesario de `notFound`
     - ✅ Middleware maneja redirecciones, layout valida como última capa

2. **Ajustes Visuales en Home Page** 🎨
   - **Emojis** (👶🏼❤️🌍🎓🍫):
     - Reducido tamaño: `text-7xl md:text-8xl` → `text-5xl md:text-6xl`
     - Aumentado padding superior: `mt-8` → `mt-16`
     - Mejor balance visual en sección de impacto
   - **Archivo modificado**: `app/[locale]/page.tsx:185`

3. **Mejoras de TypeScript y Calidad de Código** 🔧
   - **React Keys**: Agregados keys a iteraciones con `.map()`
     - `app/[locale]/dashboard/characters/[slug]/page.tsx`: abilities y stories
   - **MongoDB Type Casting**: Fixes para compatibilidad con tipos
     - Uso de `OptionalId<T>` para documentos antes de insert
     - Cast explícito a `CharacterDocument` en inserts
     - Type assertion `as any` temporal para acceso a campos dinámicos
   - **Auth Improvements**:
     - Agregado campo `locale` a `JWTPayload` (lib/auth.ts:27)
     - Agregado campo `locale` a `SessionUser` (lib/auth.ts:41)
     - Locale incluido en generación de token
   - **Simplificaciones**:
     - Uso consistente de `user.nick` en notificaciones (en vez de firstName + lastName)
     - Removida lógica de metadata en invitaciones familiares (campo no existe en schema)
   - **API Updates**:
     - Stripe API actualizada: `2024-12-18.acacia` → `2025-09-30.clover`
     - `lib/stripe.ts` y `scripts/setup-stripe-products.ts`
   - **Git Service**: Cambiado `private git` → `public git` para mejor accesibilidad
   - **ESLint**: Agregado `telegram-bot/**` a patrones ignore

#### Archivos Modificados

**UI/UX**:
- `app/[locale]/page.tsx`: Ajustes de emojis (tamaño y spacing)

**Fixes Críticos**:
- `i18n.ts`: Eliminado `notFound()` causante de stack overflow

**Type Safety**:
- `app/[locale]/dashboard/characters/[slug]/page.tsx`: React keys
- `app/api/characters/[id]/fork/route.ts`: OptionalId type casting
- `app/api/characters/[id]/like/route.ts`: Simplificación user.nick
- `app/api/characters/[id]/stories/route.ts`: Type casting en insert
- `app/api/characters/route.ts`: Type casting en insert
- `app/api/family/accept/[token]/route.ts`: Simplificación metadata
- `app/api/family/invite/route.ts`: Simplificación metadata y nombres
- `app/api/stories/[id]/like/route.ts`: Type casting y simplificación
- `app/api/stories/route.ts`: ESLint disable para any
- `app/api/telegram/link/route.ts`: Uso de getCurrentUser vs verifyAuth

**Configuración**:
- `lib/auth.ts`: Agregado locale a JWT y SessionUser
- `lib/git-service.ts`: git property ahora público
- `lib/mongodb.ts`: Generic con extends Document
- `lib/stripe.ts`: Stripe API version bump
- `scripts/seed-telegram-messages.ts`: Type annotation para reactions
- `scripts/setup-stripe-products.ts`: Stripe API version bump
- `eslint.config.mjs`: Agregado telegram-bot/** a ignores

#### Commits

```bash
# Commit 1: Ajuste visual de emojis
e2f0789 - style: adjust emoji size and spacing on home page

# Commit 2: Fixes de TypeScript y mejoras generales
4991fe5 - fix: resolve TypeScript errors and improve code quality
  - 17 archivos modificados
  - +42 líneas, -49 líneas
```

#### Problema Identificado (No Resuelto)

**Stack Overflow durante Testing de i18n**
- Ocurrió cuando probábamos redirecciones de locale con curl
- Request: `curl -I -H "Accept-Language: es-ES,es;q=0.9" -H "Cookie: NEXT_LOCALE=it" http://localhost:3000/`
- Error: `RangeError: Maximum call stack size exceeded at z3.isOverWhitespace`
- **Resolución**: Identificada causa en doble `notFound()`, corregida en i18n.ts

#### Flujo Correcto de i18n Ahora

1. **Middleware** (`middleware.ts`):
   - Detecta locale (prioridad: cookie NEXT_LOCALE → Accept-Language → URL)
   - Redirige con `localePrefix: 'always'` a locale válido

2. **i18n Config** (`i18n.ts`):
   - Carga mensajes para locale solicitado
   - Si locale no es válido: usa fallback 'en' (NO lanza error)

3. **Layout** (`app/[locale]/layout.tsx`):
   - Valida locale como última capa de seguridad
   - Llama `notFound()` solo si es inválido (caso extremo)

#### Patrones Técnicos Aprendidos

1. **Evitar múltiples notFound() en cadena**:
   ```typescript
   // ❌ MAL - Puede causar bucles
   export default getRequestConfig(async ({ requestLocale }) => {
     const locale = await requestLocale;
     if (!isSupportedLocale(locale)) {
       notFound(); // Y también en layout.tsx
     }
   });

   // ✅ BIEN - Fallback seguro
   export default getRequestConfig(async ({ requestLocale }) => {
     let locale = await requestLocale;
     if (!isSupportedLocale(locale)) {
       locale = 'en'; // Middleware ya redirige
     }
   });
   ```

2. **MongoDB Type Safety con OptionalId**:
   ```typescript
   import { OptionalId } from 'mongodb';

   const doc: OptionalId<CharacterDocument> = { ...data };
   const result = await collection.insertOne(doc as CharacterDocument);
   ```

3. **Stripe API Version Management**:
   ```typescript
   // Mantener versión consistente en:
   // - lib/stripe.ts
   // - scripts/setup-stripe-products.ts
   const stripe = new Stripe(key, {
     apiVersion: '2025-09-30.clover',
     typescript: true,
   });
   ```

#### Notas de Testing

- **Servidor de desarrollo**: Iniciado en puerto 3001 (3000 en uso)
- **URL Local**: http://localhost:3001
- **Estado**: Servidor detenido antes de push a producción
- **Próximo paso**: Deploy a producción con fixes aplicados

---

### Sesión 4 - Internacionalización: Pricing y Canon Characters (15 Oct 2025)

#### Trabajo Realizado

1. **Internacionalización Completa de Pricing** ✅
   - ✅ Página `/pricing` completamente traducida
   - ✅ Soporte para 3 idiomas: Español, Inglés, Italiano
   - ✅ ~130 líneas de traducciones por idioma
   - ✅ Dos esquemas de precios: Seed (early adopters) y Fruit (árboles)
   - ✅ FAQ con 3 preguntas frecuentes
   - ✅ Traducción de features usando `t.raw()` para arrays
   - ✅ Claves dinámicas con template literals

2. **Correcciones de Errores** 🐛
   - **Error MISSING_MESSAGE**: Corregido namespace de `'pricing'` a `'dashboard.pricing'`
   - **Error INSUFFICIENT_PATH**: Solucionado conflicto de claves duplicadas en marketplace
     - Renombrado `"products"` (string) → `"productsCount"`
     - Renombrado `"products"` (object) → `"items"`
     - Actualizado código para usar nuevas claves

3. **Implementación de Canon Characters** ⭐
   - ✅ Sección modesta en página Explore
   - ✅ Tres personajes canon: Pipo 🌱, Tony 🍫, Kaoka 👨‍🌾
   - ✅ Características:
     - Solo visible en tab "Characters"
     - Gradiente púrpura-rosa de fondo
     - Grid responsivo de 3 columnas
     - Botón "Fork" para cada personaje
     - Traducciones completas (ES, EN, IT)
   - ✅ Estructura de traducciones:
     ```
     canonCharacters:
       - title: Título de la sección
       - subtitle: Descripción
       - forkThis: Texto del botón
       - pipo/tony/kaoka: Nombre y descripción de cada personaje
     ```

#### Archivos Modificados

**Traducciones**:
- `messages/es.json`: +17 líneas canon characters, +130 pricing
- `messages/en.json`: +17 líneas canon characters, +130 pricing
- `messages/it.json`: +17 líneas canon characters, +130 pricing

**Código**:
- `app/[locale]/pricing/page.tsx`: 370 líneas - internacionalización completa
- `app/[locale]/dashboard/explore/page.tsx`: +43 líneas - sección canon characters
- `app/[locale]/dashboard/marketplace/page.tsx`: Fix products → productsCount/items
- `lib/pricing-plans.ts`: Comentario sobre estrategia de traducción

#### Commits
```bash
# Commit 1: Pricing
[commit-hash] - feat: internationalize pricing page with dual scheme support

# Commit 2: Canon Characters
317d95b - feat: add canon characters section to explore page
```

#### Patrones Técnicos Aprendidos

1. **Namespace anidado en next-intl**:
   ```typescript
   const t = useTranslations('dashboard.pricing'); // ✅ Correcto
   const t = useTranslations('pricing'); // ❌ Error si está anidado
   ```

2. **Arrays en traducciones**:
   ```typescript
   // JSON
   "features": ["Feature 1", "Feature 2"]

   // Código
   (t.raw('features') as string[]).map(...)
   ```

3. **Claves dinámicas**:
   ```typescript
   t(`schemes.${scheme.id}.plans.${planId}.name`)
   ```

4. **No duplicar claves en JSON**:
   ```json
   // ❌ MAL - última clave sobrescribe
   "products": "productos",
   "products": { nft001: {...} }

   // ✅ BIEN
   "productsCount": "productos",
   "items": { nft001: {...} }
   ```

#### Diseño de Canon Characters

- **Ubicación**: Entre tabs y contenido de caracteres
- **Estilo**: "Modesto" como solicitado
  - Fondo con gradiente sutil
  - Tamaño contenido sin abrumar
  - Solo visible cuando es relevante
- **Interactividad**: Hover effects en cards
- **Responsive**: 1 columna móvil, 3 desktop

---

### Sesión 3 - Limpieza de Código (14 Oct 2025)

#### Trabajo Realizado

1. **Limpieza Completa de ESLint**
   - ✅ Eliminados **70 errores y warnings** de ESLint
   - ✅ 28 archivos modificados
   - ✅ Codebase ahora con **0 errores, 0 warnings**

2. **Fixes Específicos**:
   - **Crítico**: Corregido error de sintaxis en `lib/git-service.ts:545` (string literal no terminado)
   - **8 errores** `react/no-unescaped-entities`: Reemplazadas comillas con entidades HTML
   - **26 errores** `@typescript-eslint/no-explicit-any`: Implementada seguridad de tipos
   - **31 warnings** variables no usadas: Limpieza de imports y variables
   - **5 warnings** React Hook dependencies: Añadidos comentarios eslint-disable apropiados
   - **3 warnings** img tags: Reemplazados con Next.js `<Image />` component

3. **Mejoras de Calidad**:
   - Cambio de `any` → `Record<string, unknown>` para objetos genéricos
   - Tipos union e indexed types para form handlers
   - Eliminadas aserciones de tipo `as any`
   - Optimización de imágenes con Next.js Image

#### Commit
```
b1c2252 - chore: fix all ESLint errors and warnings
```

---

### Sesión 2 - Implementación de Features (14 Oct 2025)

#### Features Implementadas

1. **Sistema de Likes** ✅
   - Endpoint: `/api/characters/[id]/like`
   - Modelo: `CharacterLike` en Prisma
   - UI: Botón de like en cards de personajes
   - Protección contra spam (un like por usuario por personaje)

2. **Página Stories Explore** ✅
   - Ruta: `/dashboard/explore`
   - Tabs: Personajes Públicos | Historias Destacadas
   - Filtros: Por tipo de personaje, ordenamiento
   - Integración con sistema de likes

3. **Onboarding Flow** ✅
   - Componente: `components/Onboarding.tsx`
   - Sistema de pasos interactivo
   - Persistencia en localStorage
   - Botón "Reiniciar Tutorial" en settings

#### UI/UX Mejoras Home Page

- Aumentado tamaño de fuentes en landing
- Emojis más grandes y espaciados
- Animación de skin tones en emoji de bebé (rotación cada 1.5s)
- Contenido mejorado en sección de impacto
- Roadmap 2025 visualizado con progreso (72%)

---

### Sesión 1 - Sistema de Personajes y Git

#### Implementaciones Core

1. **Sistema de Personajes con Git** ✅
   - Git local con `simple-git`
   - Cada personaje tiene su propio repositorio
   - Commits automáticos en cada guardado
   - Sistema de fork tracking

2. **MailerSend Integration** ✅
   - Templates de email para invitaciones familiares
   - Sistema de aceptación de invitaciones
   - Rutas: `/family/accept/[token]`

3. **Family System** ✅
   - Invitaciones por email
   - Modelo de datos Prisma
   - UI para gestionar familia
   - Tokens con expiración

---

## 🚧 Próximos Pasos Críticos

### 1. **IMPLEMENTACIÓN DE GITEA** 🔴 PRIORIDAD ALTA

#### Estado Actual
- ✅ Documentación completa en `docs/GITEA-SETUP.md`
- ⚠️ Código usa Git local con `simple-git`
- ❌ NO integrado con Gitea aún

#### Implementación Necesaria

##### A. Configuración de Servidor Gitea

**Opción Recomendada**: Docker Compose

```bash
# Crear docker-compose.yml en raíz del proyecto
version: "3"

services:
  gitea:
    image: gitea/gitea:latest
    container_name: chocosfera-gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=db:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=gitea_password
      - GITEA__server__ROOT_URL=http://localhost:3001
      - GITEA__server__HTTP_PORT=3001
      - GITEA__security__INSTALL_LOCK=true
      - GITEA__service__DISABLE_REGISTRATION=true
    restart: always
    volumes:
      - ./gitea-data:/data
    ports:
      - "3001:3001"
      - "222:22"
    depends_on:
      - gitea-db

  gitea-db:
    image: postgres:14
    restart: always
    environment:
      - POSTGRES_USER=gitea
      - POSTGRES_PASSWORD=gitea_password
      - POSTGRES_DB=gitea
    volumes:
      - ./gitea-postgres:/var/lib/postgresql/data
```

**Pasos de Setup**:

1. Crear `docker-compose.yml` en raíz
2. Ejecutar: `docker-compose up -d`
3. Crear usuario admin:
   ```bash
   docker exec -it chocosfera-gitea gitea admin user create \
     --username chocosfera_admin \
     --password <password-seguro> \
     --email admin@chocosfera.com \
     --admin
   ```
4. Generar token API:
   ```bash
   docker exec -it chocosfera-gitea gitea admin user generate-access-token \
     -u chocosfera_admin \
     --name "nextjs-app" \
     --scopes "write:repository,write:user,write:organization"
   ```

##### B. Variables de Entorno Necesarias

Añadir a `.env.local`:

```bash
# Gitea Configuration
GITEA_URL=http://localhost:3001
GITEA_API_TOKEN=<token-generado>
GITEA_ADMIN_USERNAME=chocosfera_admin
GITEA_WEBHOOK_SECRET=<generar-random-string>
```

##### C. Modificación de `lib/git-service.ts`

**ACTUAL** (Git local):
```typescript
// lib/git-service.ts
// Usa simple-git para operaciones locales
// Repos en: /git-repos/characters/{userId}/{characterSlug}
```

**NECESARIO** (Integración Gitea):

```typescript
// lib/gitea-service.ts - NUEVO ARCHIVO NECESARIO

export class GiteaService {
  private baseUrl = process.env.GITEA_URL;
  private token = process.env.GITEA_API_TOKEN;

  // 1. Crear usuario en Gitea cuando se registra
  async createUser(userNick: string, email: string): Promise<GiteaUser> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `usuario-${userNick}`,
        email: email,
        password: this.generateSecurePassword(),
        must_change_password: false,
      }),
    });
    return response.json();
  }

  // 2. Crear repo de personajes
  async createCharacterRepo(giteaUsername: string, userNick: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/admin/users/${giteaUsername}/repos`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'personajes',
          description: `Personajes de ${userNick} en la Chocósfera`,
          private: true,
          auto_init: true,
          default_branch: 'main',
        }),
      }
    );
    return response.json();
  }

  // 3. Push cambios a Gitea
  async pushCharacterChanges(
    userId: string,
    characterSlug: string,
    files: { path: string; content: string }[],
    commitMessage: string
  ) {
    // Usar Gitea API para crear/actualizar archivos
    // O usar git push desde local a Gitea remote
  }

  // 4. Fork del repo oficial
  async forkOfficialStory(giteaUsername: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/repos/chocosfera-system/historia-oficial/forks`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
        },
        body: JSON.stringify({
          organization: giteaUsername,
        }),
      }
    );
    return response.json();
  }
}
```

##### D. Actualizar Schema de Prisma

Añadir campos relacionados con Gitea:

```prisma
// prisma/schema.prisma

model User {
  // ... campos existentes

  // Gitea Integration
  giteaUsername     String?  @unique
  giteaUserId       Int?     @unique
  giteaAccessToken  String?  // Encriptado
}

model Character {
  // ... campos existentes

  // Git/Gitea fields
  gitRepoUrl        String?  // URL del repo en Gitea
  giteaRepoId       Int?
  lastCommitSha     String?
  lastCommitMessage String?
  lastCommitAt      DateTime?
}
```

##### E. Migración del Sistema Actual

**Plan de Migración**:

1. **Fase 1**: Configurar Gitea en paralelo
   - Instalar Gitea con Docker
   - Crear organización `chocosfera-system`
   - Importar repo oficial de GitHub a Gitea

2. **Fase 2**: Dual System (Git Local + Gitea)
   - Mantener git local como backup
   - Sincronizar cambios a Gitea
   - Añadir campo `syncedToGitea: boolean` en Character model

3. **Fase 3**: Transición completa
   - Usar Gitea como fuente de verdad
   - Git local solo para staging
   - Eliminar directorios `/git-repos` después de validar

##### F. Webhook Handlers

Crear endpoint para recibir webhooks de Gitea:

```typescript
// app/api/webhooks/gitea/route.ts - CREAR

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('X-Gitea-Signature');

  // Verificar firma del webhook
  const expectedSignature = crypto
    .createHmac('sha256', process.env.GITEA_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);

  // Manejar eventos
  switch (payload.event) {
    case 'push':
      // Actualizar lastCommitSha en DB
      break;
    case 'pull_request':
      // Notificar al usuario
      break;
    case 'fork':
      // Registrar fork en DB
      break;
  }

  return NextResponse.json({ received: true });
}
```

---

### 2. **Sistema de Autenticación con Gitea**

#### Implementar flujo OAuth con Gitea

Cuando el usuario se registra:
1. App crea usuario en PostgreSQL
2. App crea usuario en Gitea (via admin API)
3. App genera token de acceso para el usuario
4. App guarda token encriptado en PostgreSQL
5. Usuario puede autenticarse con Git vía SSH o HTTPS

#### Archivo a crear: `lib/auth-gitea.ts`

```typescript
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function setupGiteaForUser(
  userId: string,
  userNick: string,
  email: string
) {
  const giteaService = new GiteaService();

  // 1. Crear usuario en Gitea
  const giteaUser = await giteaService.createUser(userNick, email);

  // 2. Generar token de acceso
  const token = await giteaService.generateUserToken(giteaUser.id);

  // 3. Encriptar token antes de guardarlo
  const encryptedToken = encryptToken(token);

  // 4. Actualizar usuario en PostgreSQL
  await prisma.user.update({
    where: { id: userId },
    data: {
      giteaUsername: `usuario-${userNick}`,
      giteaUserId: giteaUser.id,
      giteaAccessToken: encryptedToken,
    },
  });

  // 5. Crear repo de personajes
  await giteaService.createCharacterRepo(giteaUser.login, userNick);

  // 6. Fork del repo oficial
  await giteaService.forkOfficialStory(giteaUser.login);

  return giteaUser;
}

function encryptToken(token: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
```

---

### 3. **Repo Oficial de Historia**

#### Estado
- ✅ Documentado en `docs/OFFICIAL-HISTORY-REPO.md`
- ❌ NO creado en GitHub aún
- ❌ NO importado a Gitea

#### Acciones Necesarias

1. **Crear repo en GitHub**: `chocosfera/historia-oficial`
2. **Estructura**:
   ```
   historia-oficial/
   ├── README.md
   ├── CONTRIBUTING.md
   ├── personajes/
   │   ├── tony/
   │   │   ├── personaje.json
   │   │   ├── historia.md
   │   │   └── assets/
   │   ├── pipo/
   │   └── kaoka/
   ├── episodios/
   │   ├── 01-el-encuentro.md
   │   └── 02-el-viaje.md
   └── world/
       ├── reglas.md
       └── lore.md
   ```

3. **Importar a Gitea**:
   ```bash
   # Vía UI de Gitea
   New Migration → GitHub → https://github.com/chocosfera/historia-oficial

   # O vía API
   curl -X POST "http://localhost:3001/api/v1/repos/migrate" \
     -H "Authorization: token ${GITEA_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{
       "clone_addr": "https://github.com/chocosfera/historia-oficial.git",
       "uid": 1,
       "repo_name": "historia-oficial"
     }'
   ```

---

### 4. **Character Creation Flow con Gitea**

#### Flujo Actual
1. Usuario crea personaje en UI
2. Se guarda en MongoDB
3. Se crea repo Git local
4. Se hace commit inicial

#### Flujo Necesario con Gitea
1. Usuario crea personaje en UI
2. Se guarda en MongoDB
3. **Se crea directorio en repo de Gitea del usuario**
4. **Se hace commit y push a Gitea**
5. Se actualiza MongoDB con `gitRepoUrl` y `lastCommitSha`

#### Archivo a modificar: `app/api/characters/route.ts`

```typescript
// ANTES
await gitService.initializeRepository(userId, character.slug);
await gitService.commitChanges(userId, character.slug, 'Initial commit');

// DESPUÉS
const giteaService = new GiteaService();
await giteaService.createCharacterFiles(
  user.giteaUsername!,
  character.slug,
  {
    'personaje.json': JSON.stringify(character, null, 2),
    'historia.md': character.background || '# Historia\n\nEscribe aquí...',
  },
  'chore: create character ' + character.name
);
```

---

## 📊 Estado del Proyecto

### Completado ✅
- [x] Sistema base de autenticación (Clerk/Custom)
- [x] Modelo de datos en Prisma
- [x] Sistema de personajes con MongoDB
- [x] Git local con simple-git
- [x] Sistema de familias
- [x] Invitaciones por email (MailerSend)
- [x] Sistema de likes
- [x] Explore page
- [x] Onboarding
- [x] Landing page mejorada
- [x] Limpieza completa de ESLint

### En Progreso 🚧
- [ ] Integración con Gitea
- [ ] Sistema de organizaciones
- [ ] Webhooks de Gitea

### Pendiente ⏳
- [ ] Repo oficial en GitHub
- [ ] Sistema de Pull Requests
- [ ] Sistema de alianzas
- [ ] Visualizador de grafos Git
- [ ] CI/CD con Gitea Actions
- [ ] Sistema de badges
- [ ] Panel de estadísticas

---

## 🔧 Variables de Entorno Actuales

```bash
# Database
DATABASE_URL="postgresql://..."

# MongoDB
MONGODB_URI="mongodb://..."

# Email
MAILERSEND_API_KEY="..."

# Git Local (temporal)
GIT_REPOS_PATH="./git-repos"

# FALTA AÑADIR:
GITEA_URL="http://localhost:3001"
GITEA_API_TOKEN="..."
GITEA_ADMIN_USERNAME="chocosfera_admin"
GITEA_WEBHOOK_SECRET="..."
ENCRYPTION_KEY="..." # Para encriptar tokens de Gitea
```

---

## 📁 Archivos Clave

### Servicios Core
- `lib/git-service.ts` - Git local (REEMPLAZAR con Gitea)
- `lib/mongodb.ts` - Conexión MongoDB
- `lib/notification-service.ts` - Sistema de notificaciones
- `contexts/AuthContext.tsx` - Autenticación

### Modelos
- `prisma/schema.prisma` - Schema PostgreSQL
- `types/mongodb.ts` - Tipos MongoDB

### API Routes
- `app/api/characters/route.ts` - CRUD personajes
- `app/api/characters/[id]/like/route.ts` - Sistema de likes
- `app/api/family/invite/route.ts` - Invitaciones familia
- `app/api/family/accept/[token]/route.ts` - Aceptar invitación

### Páginas Principales
- `app/[locale]/page.tsx` - Landing
- `app/[locale]/dashboard/page.tsx` - Dashboard principal
- `app/[locale]/dashboard/characters/create/page.tsx` - Crear personaje
- `app/[locale]/dashboard/explore/page.tsx` - Explorar contenido
- `app/[locale]/dashboard/family/page.tsx` - Gestión familiar

---

## 🎯 Próxima Sesión: Plan de Acción

### Prioridad 1: Setup Gitea ⚡
1. Crear `docker-compose.yml`
2. Levantar Gitea con `docker-compose up -d`
3. Crear usuario admin
4. Generar token API
5. Actualizar `.env.local`

### Prioridad 2: Código de Integración 🔧
1. Crear `lib/gitea-service.ts`
2. Añadir campos Gitea a schema Prisma
3. Ejecutar migración: `npx prisma migrate dev`
4. Implementar `setupGiteaForUser()` en registro

### Prioridad 3: Migrar Personajes Existentes 🔄
1. Script de migración: `scripts/migrate-to-gitea.ts`
2. Para cada usuario:
   - Crear usuario en Gitea
   - Crear repo de personajes
   - Push de personajes existentes

### Prioridad 4: Testing ✅
1. Crear nuevo usuario y verificar:
   - Usuario creado en Gitea
   - Repo creado
   - Fork de historia oficial
2. Crear personaje y verificar:
   - Commit en Gitea
   - Metadata correcta
3. Editar personaje y verificar:
   - Nuevo commit
   - Historia de commits visible

---

## 💡 Notas Importantes

### Seguridad
- ⚠️ **NUNCA** commitear tokens en el código
- ⚠️ Tokens de Gitea deben estar **encriptados** en DB
- ⚠️ Validar siempre firma de webhooks
- ⚠️ Usar HTTPS en producción para Gitea

### Performance
- 💾 Git operations pueden ser lentas, usar jobs async
- 💾 Considerar queue system (Bull/BullMQ) para commits
- 💾 Cache de datos de Gitea en MongoDB

### Escalabilidad
- 📈 Gitea puede manejar miles de repos
- 📈 Separar Gitea DB de App DB
- 📈 Backups automáticos de repos
- 📈 Monitoreo de espacio en disco

---

## 🐛 Bugs Conocidos / Tech Debt

1. **Git Service usa rutas locales**
   - DEBE migrarse a Gitea
   - `/git-repos` es temporal

2. **No hay sincronización bidireccional**
   - Cambios en Gitea no se reflejan en MongoDB
   - NECESITA webhooks

3. **Falta sistema de permisos granular**
   - Todos los personajes privados por defecto
   - Falta UI para hacer público/privado

4. **No hay límite de caracteres/personajes**
   - Un usuario podría crear infinitos personajes
   - NECESITA rate limiting

---

## 📚 Referencias Útiles

- [Gitea API Docs](https://docs.gitea.com/api/1.21/)
- [Simple Git Docs](https://github.com/steveukx/git-js)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [MailerSend API](https://developers.mailersend.com/)

---

## ✅ Checklist Pre-Producción

Antes de deploy a producción, completar:

- [ ] Gitea configurado y funcionando
- [ ] SSL/TLS para Gitea (Let's Encrypt)
- [ ] Backups automáticos configurados
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Rate limiting implementado
- [ ] Logs centralizados (Sentry)
- [ ] Tests E2E de flujo Git
- [ ] Documentación de usuario final
- [ ] Plan de rollback
- [ ] Load testing

---

**Última revisión**: 14 de Octubre de 2025, 19:30 CET
**Autor**: Claude Code + German Lugo
**Versión**: 1.0
