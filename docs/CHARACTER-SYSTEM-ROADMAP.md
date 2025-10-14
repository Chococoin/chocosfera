# Sistema de Personajes - Roadmap y Changelog

## Estado Actual del Proyecto

**Última actualización**: 14 de Octubre, 2025

El sistema de personajes de la Chocósfera está diseñado para permitir a los usuarios crear personajes únicos con trazabilidad completa mediante Git. Cada personaje tiene su propia historia y puede evolucionar a través de commits, fork, y pull requests.

---

## ✅ Implementado (v1.0 - Octubre 2025)

### 1. Infraestructura y Backend

#### MongoDB Schema (`/types/mongodb.ts`)
- ✅ Definición completa de tipos TypeScript para MongoDB
- ✅ `CharacterDocument`: Estructura principal de personajes
- ✅ `StoryDocument`: Historias asociadas a personajes
- ✅ `OrganizationDocument`: Organizaciones para familias/alianzas
- ✅ `BadgeDocument`: Sistema de insignias
- ✅ Índices y validaciones

#### Git Service Layer (`/lib/git-service.ts`)
- ✅ `GitService`: Clase para operaciones Git locales
- ✅ `GiteaClient`: Cliente para interactuar con Gitea (preparado para futuro)
- ✅ Inicialización de repositorios de usuario
- ✅ Creación de commits de personajes y historias
- ✅ Obtención de historial Git
- ✅ Operaciones de branch, push, pull, merge
- ✅ Detección automática si Gitea está configurado

#### API Endpoints

**Characters CRUD** (`/app/api/characters/route.ts`)
- ✅ `POST /api/characters` - Crear personaje
  - Validación de campos requeridos
  - Generación automática de slug
  - Verificación de duplicados
  - Inicialización de repositorio Git
  - Commit inicial de personaje
  - Creación de documento en MongoDB

- ✅ `GET /api/characters` - Listar personajes
  - Filtros: usuario, público, familia
  - Paginación (limit, skip)
  - Soporte para includePublic y familyId

**Character Details** (`/app/api/characters/[id]/route.ts`)
- ✅ `GET /api/characters/[id]` - Obtener personaje
  - Sistema de permisos (owner/public/family)
  - Incremento de contador de vistas
  - Metadata de permisos (canEdit, canDelete, canFork)

- ✅ `PUT /api/characters/[id]` - Actualizar personaje
  - Solo el propietario puede editar
  - Campos editables: name, description, personality, abilities, motto, isPublic, tags, assets
  - Actualización de publishedAt al hacer público

- ✅ `DELETE /api/characters/[id]` - Eliminar personaje
  - Soft delete (marca deletedAt)
  - Solo el propietario puede eliminar
  - Hace privado automáticamente

**Character History** (`/app/api/characters/[id]/history/route.ts`)
- ✅ `GET /api/characters/[id]/history` - Obtener historial Git
  - Límite configurable de commits
  - Transformación de datos para frontend
  - Metadata: totalCommits, firstCommit, latestCommit
  - Manejo graceful de repos sin Git

### 2. Frontend UI

#### Pages

**Characters List** (`/app/[locale]/dashboard/characters/page.tsx`)
- ✅ Vista en grid de todos los personajes del usuario
- ✅ Estado vacío con CTA prominente
- ✅ Cards de personaje con:
  - Ícono/avatar del personaje
  - Nombre y tipo
  - Descripción truncada
  - Stats: Historias, Commits, Vistas
  - Indicador público/privado
  - Última actualización
- ✅ Botón "Crear Personaje"
- ✅ Estados de loading y error
- ✅ Card informativa sobre qué son los personajes

**Character Creation Wizard** (`/app/[locale]/dashboard/characters/create/page.tsx`)
- ✅ Wizard de 4 pasos con barra de progreso
- ✅ **Paso 1: Datos Básicos**
  - Nombre (validación 2-50 caracteres)
  - Tipo de personaje (cacao, chocolate, farmer, other)
  - Selector de ícono (27+ opciones)

- ✅ **Paso 2: Descripción y Personalidad**
  - Descripción (20-500 caracteres)
  - Personalidad (opcional, 0-300 caracteres)
  - Habilidades especiales (hasta 5)
  - Lema/frase característica (0-150 caracteres)

- ✅ **Paso 3: Historia de Llegada**
  - Historia inicial de cómo llegó a la Chocósfera
  - Box de inspiración con "El Portal del Chocolate"
  - Validación 50-2000 caracteres
  - Explicación de que será el primer commit

- ✅ **Paso 4: Revisión y Confirmación**
  - Preview completo del personaje
  - Selector de visibilidad (público/privado)
  - Información sobre qué sucederá al crear
  - Botón de creación con loading state

- ✅ Validación en cada paso
- ✅ Navegación adelante/atrás
- ✅ Manejo de errores
- ✅ Integración con API

**Character Detail** (`/app/[locale]/dashboard/characters/[slug]/page.tsx`)
- ✅ Banner con ícono grande y stats
- ✅ Indicadores de público/fork
- ✅ Botones de editar/eliminar (según permisos)
- ✅ Modal de confirmación para eliminar
- ✅ Sistema de tabs:
  - **Overview**: Información general
    - Descripción completa
    - Personalidad
    - Habilidades especiales
    - Lema
    - Información de repositorio Git
    - Metadata (fechas, slug)
  - **Historial Git**: Timeline de commits
    - SHA corto de cada commit
    - Mensaje del commit
    - Autor y email
    - Timestamp relativo (hace X minutos/horas/días)
- ✅ Estados de loading
- ✅ Manejo de errores
- ✅ Sistema de permisos implementado

**Character Edit** (`/app/[locale]/dashboard/characters/[slug]/edit/page.tsx`)
- ✅ Formulario de edición completo
- ✅ Nombre y tipo (read-only, no editables)
- ✅ Selector de ícono
- ✅ Descripción y personalidad editables
- ✅ Manager de habilidades (agregar/remover)
- ✅ Lema editable
- ✅ Selector de visibilidad
- ✅ Validación de campos
- ✅ Botones Cancelar/Guardar
- ✅ Estados de loading y error
- ✅ Verificación de permisos
- ✅ Redirección al detalle tras guardar

#### Navigation

**Sidebar** (`/app/[locale]/dashboard/components/Sidebar.tsx`)
- ✅ Enlace "Mis Personajes" con ícono 🎭
- ✅ Posicionado entre "Mi Familia" y "Trazabilidad"
- ✅ Activo cuando se está en ruta de personajes

### 3. Documentación

**Gitea Setup** (`/docs/GITEA-SETUP.md`)
- ✅ Guía completa de instalación de Gitea
- ✅ Instalación con Docker y binario
- ✅ Configuración de app.ini
- ✅ Generación de API tokens
- ✅ Configuración de webhooks
- ✅ Estructura de organizaciones
- ✅ Ejemplos de uso de API

**Official History Repository** (`/docs/OFFICIAL-HISTORY-REPO.md`)
- ✅ README completo para GitHub
- ✅ Historia inicial "El Portal"
- ✅ Estructura del repositorio oficial
- ✅ Ejemplo completo de Tony (personaje canónico)
- ✅ Guía de contribución
- ✅ Explicación del sistema de fork/PR

### 4. Configuración

**Environment Variables** (`.env.local`)
- ✅ `GITEA_URL` - URL de Gitea
- ✅ `GITEA_API_TOKEN` - Token de API
- ✅ `GITEA_ADMIN_USERNAME` - Usuario admin
- ✅ `GITEA_WEBHOOK_SECRET` - Secret para webhooks
- ✅ `GITHUB_OFFICIAL_REPO` - URL del repo oficial
- ✅ `GIT_REPOS_DIR` - Directorio para repos locales

**Dependencies**
- ✅ `simple-git` instalado y configurado

---

## 📋 Roadmap Futuro

### Fase 2: Sistema de Historias (Próximo)

- [ ] **Editor de Historias**
  - Editor Markdown con preview
  - Autoguardado
  - Sintaxis highlighting
  - Inserción de imágenes

- [ ] **Story Management**
  - Crear nueva historia para personaje
  - Editar historias existentes
  - Eliminar historias
  - Ordenar historias cronológicamente

- [ ] **Git Integration para Historias**
  - Cada historia es un commit
  - Formato de commit: `story: [título de la historia]`
  - Diff viewer para ver cambios

### Fase 3: Sistema de Fork y Colaboración

- [ ] **Fork de Personajes**
  - Fork de personajes canónicos (Tony, Pipo, Kaoka)
  - Fork de personajes públicos de otros usuarios
  - Tracking de fork parents
  - Estadísticas de forks

- [ ] **Pull Requests**
  - UI para crear PRs
  - Lista de PRs pendientes
  - Review de cambios
  - Aprobación/rechazo de PRs
  - Merge automático o manual
  - Notificaciones de PRs

- [ ] **Colaboración Familiar**
  - Visualización de personajes de la familia
  - Sugerencias de colaboración
  - Timeline compartido de commits

### Fase 4: Visualización Avanzada

- [ ] **Git Timeline Interactivo**
  - Visualización gráfica de commits
  - Branch viewer
  - Diff comparator
  - Blame view (quién cambió qué)

- [ ] **Character Profile Pages**
  - Página pública para personajes
  - Preview de historias
  - Botón de fork
  - Comentarios y likes

- [ ] **Galería de Personajes**
  - Explorar personajes públicos
  - Filtros por tipo, tags
  - Búsqueda
  - Personajes destacados

### Fase 5: Assets y Personalización

- [ ] **Sistema de Assets**
  - Upload de avatares personalizados
  - Upload de banners
  - Galería de assets
  - Optimización de imágenes

- [ ] **Temas y Estilos**
  - Páginas HTML/CSS/JS personalizadas
  - Editor de código integrado
  - Preview en vivo
  - Templates prediseñados

### Fase 6: Integración con Gitea

- [ ] **Gitea Integration**
  - Configuración de Gitea server
  - Creación automática de usuarios en Gitea
  - Creación de repos en Gitea
  - Push automático a Gitea
  - Webhooks de Gitea → App

- [ ] **Organizations en Gitea**
  - Crear organizaciones para familias
  - Permisos de organización
  - Repos compartidos

### Fase 7: Gamificación y Social

- [ ] **Sistema de Badges**
  - Insignias por logros
  - Primera historia, 10 commits, etc.
  - Insignias por colaboración
  - Display de badges en perfil

- [ ] **Likes y Favoritos**
  - Like a personajes
  - Lista de favoritos
  - Personajes más populares

- [ ] **Comentarios**
  - Comentar en personajes
  - Comentar en historias
  - Moderación de comentarios

### Fase 8: Experiencia Educativa

- [ ] **Tutoriales Interactivos**
  - Tutorial de Git básico
  - Explicación de commits
  - Explicación de forks/PRs
  - Tutorial de HTML/CSS/JS

- [ ] **Métricas Educativas**
  - Progreso de aprendizaje
  - Conceptos de Git dominados
  - Estadísticas de colaboración

---

## 📝 Changelog - v1.0 (Octubre 2025)

### Backend

#### Nuevos Archivos
- `types/mongodb.ts` - Schemas completos de MongoDB (400+ líneas)
- `lib/git-service.ts` - Servicio de Git con GitService y GiteaClient (450+ líneas)
- `app/api/characters/route.ts` - POST y GET para personajes (264 líneas)
- `app/api/characters/[id]/route.ts` - GET, PUT, DELETE para personaje individual (279 líneas)
- `app/api/characters/[id]/history/route.ts` - GET historial Git (116 líneas)

#### Modificaciones
- `.env.local` - Agregadas variables de Gitea y GitHub
- `package.json` - Agregada dependencia `simple-git`

### Frontend

#### Nuevas Páginas
- `app/[locale]/dashboard/characters/page.tsx` - Lista de personajes (278 líneas)
- `app/[locale]/dashboard/characters/create/page.tsx` - Wizard de creación (580+ líneas)
- `app/[locale]/dashboard/characters/[slug]/page.tsx` - Detalle de personaje (450+ líneas)
- `app/[locale]/dashboard/characters/[slug]/edit/page.tsx` - Edición de personaje (420+ líneas)

#### Modificaciones
- `app/[locale]/dashboard/components/Sidebar.tsx` - Agregado enlace "Mis Personajes"

### Documentación

#### Nuevos Documentos
- `docs/GITEA-SETUP.md` - Guía completa de Gitea (600+ líneas)
- `docs/OFFICIAL-HISTORY-REPO.md` - Estructura del repo oficial (800+ líneas)
- `docs/CHARACTER-SYSTEM-ROADMAP.md` - Este documento

### Características Implementadas

1. **Creación de Personajes**: Wizard completo de 4 pasos con validación
2. **Gestión CRUD**: Crear, leer, actualizar, eliminar personajes
3. **Git Integration**: Cada personaje vive en Git con commits trazables
4. **Permisos**: Sistema de permisos owner/public/family
5. **UI Completa**: Lista, detalle, creación, edición
6. **Historia Git**: Visualización de commits con metadata
7. **Tipos de Personajes**: Cacao, Chocolate, Agricultor, Otro
8. **Customización**: 27+ íconos, habilidades, lema, personalidad
9. **Visibilidad**: Público/Privado con controles
10. **Soft Delete**: Eliminación segura sin pérdida de datos

### Estadísticas del Release

- **Archivos Nuevos**: 12
- **Archivos Modificados**: 3
- **Líneas de Código Backend**: ~1,500
- **Líneas de Código Frontend**: ~1,800
- **Líneas de Documentación**: ~1,600
- **Total**: ~4,900 líneas

---

## 🏗️ Arquitectura del Sistema

### Flujo de Creación de Personaje

```
Usuario → Wizard (4 pasos) → POST /api/characters
                              ↓
                        Validar datos
                              ↓
                        Generar slug
                              ↓
                    Verificar duplicados
                              ↓
                  Inicializar repo Git usuario
                              ↓
                    Crear commit de personaje
                    /personajes/{slug}/personaje.json
                    /personajes/{slug}/historia/01-llegada.md
                              ↓
                    Guardar en MongoDB
                    CharacterDocument
                              ↓
                    Retornar personaje creado
                              ↓
                    Redirect a /characters/{slug}
```

### Estructura de Repositorio de Usuario

```
.git-repos/user-{userId}/
├── .git/
├── README.md
└── personajes/
    ├── nombre-personaje/
    │   ├── personaje.json           # Metadata del personaje
    │   ├── historia/
    │   │   ├── 01-llegada.md        # Historia inicial
    │   │   ├── 02-aventura.md       # Historia 2
    │   │   └── ...
    │   ├── web/                      # Futuro: páginas HTML
    │   │   ├── index.html
    │   │   ├── style.css
    │   │   └── script.js
    │   └── assets/                   # Futuro: imágenes
    │       ├── avatar.png
    │       └── banner.jpg
    └── otro-personaje/
        └── ...
```

### Modelo de Datos

**CharacterDocument (MongoDB)**
```typescript
{
  _id: ObjectId,
  userId: string,                    // Propietario
  name: string,                      // Nombre del personaje
  slug: string,                      // URL-friendly slug
  characterType: 'cacao' | ...,      // Tipo
  description: string,               // Descripción
  personality: string,               // Personalidad
  abilities: string[],               // Habilidades
  motto: string,                     // Lema

  // Git
  gitRepo: string,                   // Path al repo
  gitPath: string,                   // Path dentro del repo
  lastCommitSha: string,             // SHA del último commit
  lastCommitMessage: string,         // Mensaje
  lastCommitDate: Date,              // Fecha

  // Fork
  isFork: boolean,                   // Es un fork?
  forkedFrom: string?,               // ID del original
  forkedCharacter: string?,          // tony/pipo/kaoka

  // Visibilidad
  isPublic: boolean,                 // Público o privado
  familyId: string?,                 // ID de familia

  // Stats
  stats: {
    viewCount: number,
    likeCount: number,
    forkCount: number,
    commitsCount: number,
    storiesCount: number
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date?,
  deletedAt: Date?
}
```

---

## 🔐 Sistema de Permisos

### Niveles de Acceso

1. **Owner (Propietario)**
   - Ver personaje
   - Editar personaje
   - Eliminar personaje
   - Ver commits privados
   - Cambiar visibilidad

2. **Family (Familia)**
   - Ver personaje (si isPublic o familyId match)
   - Ver commits
   - Crear fork
   - Crear PR

3. **Public (Público)**
   - Ver personaje (solo si isPublic)
   - Ver commits públicos
   - Crear fork
   - Dar like

4. **Anonymous (No autenticado)**
   - Ver personajes públicos (solo lectura)
   - Ver commits públicos

### Validación en APIs

Todas las rutas de API verifican permisos:
```typescript
const isOwner = user && character.userId === user.id;
const isPublic = character.isPublic;
const isFamilyMember = user && user.familyId && character.familyId === user.familyId;
const hasAccess = isOwner || isPublic || isFamilyMember;

if (!hasAccess) {
  return 403 Forbidden;
}
```

---

## 🎯 Próximos Pasos Inmediatos

1. **Implementar Editor de Historias** (Prioridad Alta)
   - Los usuarios necesitan poder agregar historias a sus personajes
   - Cada historia debe crear un commit en Git
   - Markdown editor con preview

2. **Mejorar Visualización de Git History**
   - Timeline visual más atractivo
   - Diff viewer para ver cambios
   - Filtros por tipo de commit

3. **Sistema de Fork**
   - Permitir fork de personajes canónicos
   - UI para seleccionar personaje base
   - Tracking de genealogía de forks

4. **Testing**
   - Unit tests para Git service
   - Integration tests para APIs
   - E2E tests para flujo de creación

---

## 📚 Referencias

- **Gitea API**: https://docs.gitea.io/en-us/api-usage/
- **simple-git**: https://github.com/steveukx/git-js
- **MongoDB Node Driver**: https://mongodb.github.io/node-mongodb-native/
- **Next.js 15**: https://nextjs.org/docs

---

## 🤝 Contribución

Para contribuir al desarrollo del sistema de personajes:

1. Revisar el roadmap y elegir una tarea
2. Seguir los patrones establecidos en el código
3. Documentar cambios en este archivo
4. Crear commits descriptivos
5. Probar exhaustivamente antes de merge

---

**Última revisión**: 14 de Octubre, 2025
**Versión**: 1.0.0
**Estado**: ✅ Producción (MVP)
