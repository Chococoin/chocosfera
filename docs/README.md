# Documentación Técnica - Chocósfera

**Proyecto**: Chocósfera - Plataforma educativa de cacao y blockchain
**Stack**: Next.js 15, PostgreSQL, MongoDB, Gitea, Prisma
**Última actualización**: 14 de Octubre de 2025

---

## 📚 Índice de Documentación

### 🎯 Guías de Inicio Rápido

1. **[SESSION-NOTES.md](./SESSION-NOTES.md)** - ⭐ **EMPEZAR AQUÍ**
   - Resumen completo de todas las sesiones
   - Estado actual del proyecto
   - Próximos pasos prioritarios
   - Contexto para nuevas sesiones
   - **Leer primero antes de continuar el desarrollo**

### 🚧 Implementación Pendiente (Alta Prioridad)

2. **[GIT-TO-GITEA-MIGRATION.md](./GIT-TO-GITEA-MIGRATION.md)** - 🔴 **PRIORIDAD CRÍTICA**
   - Plan completo de migración de Git local a Gitea
   - Código completo para `gitea-service.ts`
   - Scripts de migración de datos
   - Guía de webhooks
   - Checklist de implementación
   - **Tiempo estimado**: 8-12 horas
   - **Siguiente tarea principal a implementar**

### 🏗️ Arquitectura y Configuración

3. **[DATABASE-ARCHITECTURE.md](./DATABASE-ARCHITECTURE.md)**
   - Schema completo de PostgreSQL (Prisma)
   - Colecciones de MongoDB
   - Relaciones entre modelos
   - Índices y optimizaciones
   - Guía de migraciones

4. **[GITEA-SETUP.md](./GITEA-SETUP.md)**
   - Instalación de Gitea (Docker y binario)
   - Configuración inicial
   - API usage examples
   - Sistema de organizaciones
   - Troubleshooting
   - **Complementa**: GIT-TO-GITEA-MIGRATION.md

### ✨ Features Implementadas

5. **[CHARACTER-SYSTEM-ROADMAP.md](./CHARACTER-SYSTEM-ROADMAP.md)**
   - Sistema de personajes
   - Git integration (local - pendiente Gitea)
   - Forks y colaboración
   - Character types y metadata
   - Roadmap de features

6. **[EMAIL-SYSTEM.md](./EMAIL-SYSTEM.md)**
   - Integración con MailerSend
   - Templates de emails
   - Sistema de invitaciones familiares
   - Tokens de verificación
   - Rate limiting

7. **[OFFICIAL-HISTORY-REPO.md](./OFFICIAL-HISTORY-REPO.md)**
   - Estructura del repositorio oficial
   - Personajes oficiales (Tony, Pipo, Kaoka)
   - Sistema de episodios
   - Lore y reglas del mundo
   - **Pendiente**: Crear repo en GitHub e importar a Gitea

---

## 🗺️ Mapa de Navegación

```
docs/
├── README.md                          # 👈 Estás aquí
│
├── 🎯 START HERE
│   └── SESSION-NOTES.md               # Contexto completo y próximos pasos
│
├── 🚨 ALTA PRIORIDAD
│   └── GIT-TO-GITEA-MIGRATION.md      # Implementación urgente de Gitea
│
├── 🏗️ ARQUITECTURA
│   ├── DATABASE-ARCHITECTURE.md        # Schemas y modelos
│   └── GITEA-SETUP.md                 # Setup de Gitea
│
└── ✨ FEATURES
    ├── CHARACTER-SYSTEM-ROADMAP.md    # Sistema de personajes
    ├── EMAIL-SYSTEM.md                # MailerSend
    └── OFFICIAL-HISTORY-REPO.md       # Repo oficial
```

---

## 🚀 Quick Start para Nueva Sesión

### 1. Leer Contexto
```bash
# Leer notas de sesión
cat docs/SESSION-NOTES.md

# Ver estado actual
git log --oneline -10
npm run lint
```

### 2. Setup Local
```bash
# Instalar dependencias
npm install

# Configurar .env.local (ver SESSION-NOTES.md)
cp .env.example .env.local

# Ejecutar migraciones
npx prisma migrate dev
npx prisma generate

# Levantar dev server
npm run dev
```

### 3. Siguiente Tarea: Gitea
```bash
# Leer guía completa
cat docs/GIT-TO-GITEA-MIGRATION.md

# Crear docker-compose para Gitea
# (seguir instrucciones en el documento)

# Implementar gitea-service.ts
# (código completo en el documento)
```

---

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Sistema de autenticación
- [x] Base de datos dual (PostgreSQL + MongoDB)
- [x] Sistema de personajes con Git local
- [x] Sistema de familias
- [x] Invitaciones por email
- [x] Sistema de likes
- [x] Explore page
- [x] Onboarding flow
- [x] Landing page mejorada
- [x] Limpieza completa de ESLint (0 errores, 0 warnings)

### 🚧 En Progreso
- [ ] Migración a Gitea (PRIORIDAD 1)
- [ ] Sistema de organizaciones
- [ ] Webhooks

### ⏳ Backlog
- [ ] Crear repo oficial en GitHub
- [ ] Sistema de Pull Requests
- [ ] Sistema de alianzas
- [ ] Visualizador de grafos Git
- [ ] CI/CD con Gitea Actions
- [ ] Sistema de badges
- [ ] Panel de estadísticas

---

## 🔧 Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI**: Custom components
- **i18n**: next-intl (español/inglés)

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **ORM**: Prisma (PostgreSQL)
- **MongoDB**: Cliente nativo

### Databases
- **PostgreSQL**: Datos estructurados (usuarios, familias)
- **MongoDB**: Datos flexibles (personajes, historias)

### Git & Collaboration
- **Current**: simple-git (local)
- **Target**: Gitea (self-hosted)

### Email
- **Provider**: MailerSend
- **Templates**: HTML + Text

### DevOps
- **Hosting**: TBD
- **Containers**: Docker (Gitea)
- **CI/CD**: Pendiente (Gitea Actions)

---

## 📁 Estructura del Proyecto

```
chocosfera/
├── app/                           # Next.js App Router
│   ├── [locale]/                  # Rutas internacionalizadas
│   │   ├── page.tsx               # Landing page
│   │   ├── dashboard/             # Dashboard principal
│   │   │   ├── characters/        # Gestión de personajes
│   │   │   ├── explore/           # Explorar contenido
│   │   │   ├── family/            # Gestión familiar
│   │   │   └── impact/            # Panel de impacto
│   │   └── family/accept/         # Aceptar invitaciones
│   └── api/                       # API Routes
│       ├── characters/            # CRUD personajes
│       ├── family/                # Sistema familiar
│       └── webhooks/              # Webhooks (Gitea)
│
├── components/                    # Componentes React
│   ├── Onboarding.tsx            # Tutorial interactivo
│   └── ProtectedRoute.tsx        # Auth guard
│
├── contexts/                      # React Contexts
│   └── AuthContext.tsx           # Autenticación
│
├── lib/                          # Utilidades y servicios
│   ├── git-service.ts            # Git local (REEMPLAZAR)
│   ├── gitea-service.ts          # 🚨 PENDIENTE CREAR
│   ├── mongodb.ts                # Cliente MongoDB
│   └── notification-service.ts   # Notificaciones
│
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Schema PostgreSQL
│   └── migrations/               # Historial de migraciones
│
├── docs/                         # 📚 Documentación (estás aquí)
│   ├── README.md
│   ├── SESSION-NOTES.md
│   ├── GIT-TO-GITEA-MIGRATION.md
│   └── ...
│
├── git-repos/                    # Git local (temporal)
│   └── characters/               # Repos de personajes
│
└── scripts/                      # Scripts de utilidad
    └── migrate-to-gitea.ts       # 🚨 PENDIENTE CREAR
```

---

## 🎓 Recursos de Aprendizaje

### Para Gitea
- [Gitea Docs](https://docs.gitea.com/)
- [Gitea API Reference](https://docs.gitea.com/api/1.21/)
- [Docker Setup](https://docs.gitea.com/installation/install-with-docker)

### Para Next.js 15
- [Next.js Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Para Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### Para MongoDB
- [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Best Practices](https://www.mongodb.com/docs/manual/administration/production-notes/)

---

## 🤝 Contribución

### Workflow de Desarrollo

1. **Leer contexto**: `SESSION-NOTES.md`
2. **Crear rama**: `git checkout -b feature/nombre`
3. **Desarrollar**: Seguir guías en `/docs`
4. **Lint**: `npm run lint` (debe pasar sin errores)
5. **Commit**: Mensajes descriptivos con Co-Authored-By
6. **Actualizar docs**: Si es feature grande

### Estilo de Commits

```
tipo: descripción breve

Descripción detallada del cambio y su contexto.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Tipos**:
- `feat`: Nueva feature
- `fix`: Corrección de bug
- `chore`: Mantenimiento/limpieza
- `docs`: Documentación
- `refactor`: Refactorización
- `test`: Tests

---

## 🐛 Issues Conocidos

Ver **SESSION-NOTES.md** sección "Bugs Conocidos / Tech Debt"

---

## 📞 Contacto

**Proyecto**: Chocósfera
**Maintainer**: German Lugo
**Email**: g.lugo.dev@gmail.com
**GitHub**: (pendiente link al repo)

---

## 📄 Licencia

[Pendiente definir]

---

**Última revisión**: 14 de Octubre de 2025
**Versión**: 1.0
