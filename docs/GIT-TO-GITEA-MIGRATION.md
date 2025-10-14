# Migración de Git Local a Gitea

**Estado**: 🔴 PENDIENTE - ALTA PRIORIDAD
**Fecha**: 14 de Octubre de 2025

---

## 🎯 Objetivo

Migrar el sistema actual de Git local (usando `simple-git`) a un servidor Gitea auto-hospedado para:
- Centralizar los repositorios
- Permitir colaboración entre usuarios
- Habilitar forks y pull requests
- Proporcionar una UI web para ver código
- Implementar webhooks para sincronización

---

## 📊 Estado Actual del Sistema Git

### Implementación Existente

#### 1. `lib/git-service.ts`

**Ubicación de Repos**: `/git-repos/characters/{userId}/{characterSlug}`

**Funcionalidades Actuales**:
```typescript
class GitService {
  // ✅ Inicializar repo local
  async initializeRepository(userId: string, characterSlug: string)

  // ✅ Hacer commit de cambios
  async commitChanges(userId: string, characterSlug: string, message: string)

  // ✅ Obtener historial de commits
  async getCommitHistory(userId: string, characterSlug: string)

  // ✅ Obtener contenido de archivo en commit específico
  async getFileAtCommit(userId: string, characterSlug: string, sha: string, file: string)
}
```

**Estructura de Directorios**:
```
/git-repos/
  └── characters/
      └── {userId}/
          └── {characterSlug}/
              ├── .git/
              ├── personaje.json
              ├── historia.md
              └── assets/
                  └── icon.png (opcional)
```

#### 2. Integración en API Routes

**`app/api/characters/route.ts`** (POST - Crear personaje):
```typescript
// Líneas 120-125
await gitService.initializeRepository(user.id, newCharacter.slug);

await gitService.commitChanges(
  user.id,
  newCharacter.slug,
  `chore: initialize repository

Created initial repository structure for character management.`
);
```

**`app/api/characters/[id]/route.ts`** (PATCH - Editar personaje):
```typescript
// Líneas 160-165
await gitService.commitChanges(
  user.id,
  existingCharacter.slug,
  `feat: update character ${characterData.name}

Updated character metadata and story content.`
);
```

#### 3. Modelo MongoDB

**Campo Git en Character**:
```typescript
{
  lastCommitSha: string | null;
  lastCommitMessage: string | null;
  lastCommitAt: Date | null;
}
```

---

## 🚀 Plan de Migración

### Fase 1: Setup de Gitea (1-2 horas)

#### 1.1 Instalación con Docker

**Crear `docker-compose.gitea.yml`** en raíz del proyecto:

```yaml
version: "3"

networks:
  gitea:
    external: false

services:
  gitea-server:
    image: gitea/gitea:1.21.0
    container_name: chocosfera-gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=gitea-db:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=gitea_secure_password_123
      - GITEA__server__ROOT_URL=http://localhost:3001
      - GITEA__server__DOMAIN=localhost
      - GITEA__server__HTTP_PORT=3001
      - GITEA__server__SSH_PORT=222
      - GITEA__security__INSTALL_LOCK=true
      - GITEA__service__DISABLE_REGISTRATION=true
      - GITEA__service__REQUIRE_SIGNIN_VIEW=false
      - GITEA__api__ENABLE_SWAGGER=true
    restart: always
    networks:
      - gitea
    volumes:
      - ./gitea-data:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3001:3001"  # HTTP
      - "222:22"     # SSH
    depends_on:
      - gitea-db

  gitea-db:
    image: postgres:14-alpine
    container_name: chocosfera-gitea-db
    restart: always
    environment:
      - POSTGRES_USER=gitea
      - POSTGRES_PASSWORD=gitea_secure_password_123
      - POSTGRES_DB=gitea
    networks:
      - gitea
    volumes:
      - ./gitea-postgres-data:/var/lib/postgresql/data
```

**Comandos**:
```bash
# Levantar Gitea
docker-compose -f docker-compose.gitea.yml up -d

# Ver logs
docker-compose -f docker-compose.gitea.yml logs -f gitea-server

# Parar Gitea
docker-compose -f docker-compose.gitea.yml down
```

#### 1.2 Configuración Inicial

```bash
# 1. Crear usuario administrador
docker exec -it chocosfera-gitea gitea admin user create \
  --username chocosfera_admin \
  --password AdminP@ssw0rd! \
  --email admin@chocosfera.com \
  --admin \
  --must-change-password=false

# 2. Generar token API para la aplicación
docker exec -it chocosfera-gitea gitea admin user generate-access-token \
  -u chocosfera_admin \
  --name "nextjs-app-token" \
  --scopes "write:repository,write:user,write:organization,write:admin"

# 3. Crear organización del sistema
# (Esto se hará vía API desde la app)
```

#### 1.3 Variables de Entorno

**Añadir a `.env.local`**:

```bash
# Gitea Configuration
GITEA_URL=http://localhost:3001
GITEA_API_TOKEN=<token-generado-en-paso-anterior>
GITEA_ADMIN_USERNAME=chocosfera_admin
GITEA_WEBHOOK_SECRET=<generar-con: openssl rand -hex 32>

# Token Encryption (para guardar tokens de usuarios)
ENCRYPTION_KEY=<generar-con: openssl rand -hex 32>
ENCRYPTION_ALGORITHM=aes-256-gcm
```

#### 1.4 Verificación

```bash
# Probar que Gitea funciona
curl http://localhost:3001/api/v1/version

# Probar autenticación
curl -H "Authorization: token ${GITEA_API_TOKEN}" \
     http://localhost:3001/api/v1/user
```

---

### Fase 2: Código de Integración (3-4 horas)

#### 2.1 Crear `lib/gitea-service.ts`

```typescript
import crypto from 'crypto';

export interface GiteaUser {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
}

export interface GiteaRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
}

export class GiteaService {
  private baseUrl: string;
  private adminToken: string;

  constructor() {
    this.baseUrl = process.env.GITEA_URL || 'http://localhost:3001';
    this.adminToken = process.env.GITEA_API_TOKEN || '';
  }

  /**
   * Crear usuario en Gitea cuando se registra en la app
   */
  async createUser(
    nick: string,
    email: string,
    fullName?: string
  ): Promise<GiteaUser> {
    const username = this.sanitizeUsername(nick);
    const password = this.generateSecurePassword();

    const response = await fetch(`${this.baseUrl}/api/v1/admin/users`, {
      method: 'POST',
      headers: {
        Authorization: `token ${this.adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        full_name: fullName || nick,
        must_change_password: false,
        send_notify: false,
        visibility: 'private',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create Gitea user: ${error}`);
    }

    return response.json();
  }

  /**
   * Generar token de acceso para un usuario
   */
  async generateUserToken(username: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/admin/users/${username}/tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${this.adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `user-token-${Date.now()}`,
          scopes: [
            'write:repository',
            'write:user',
            'write:organization',
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate user token');
    }

    const data = await response.json();
    return data.sha1; // Token string
  }

  /**
   * Crear repositorio de personajes para un usuario
   */
  async createCharactersRepo(
    username: string,
    userNick: string
  ): Promise<GiteaRepo> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/admin/users/${username}/repos`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${this.adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'personajes',
          description: `Personajes de ${userNick} en la Chocósfera`,
          private: true,
          auto_init: true,
          default_branch: 'main',
          readme: 'Default',
          gitignores: '',
          license: 'CC-BY-SA-4.0',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create characters repo');
    }

    return response.json();
  }

  /**
   * Crear/actualizar archivo en un repo
   */
  async createOrUpdateFile(
    username: string,
    repoName: string,
    filePath: string,
    content: string,
    commitMessage: string,
    branch = 'main',
    sha?: string // SHA del archivo si ya existe (para updates)
  ) {
    const encodedContent = Buffer.from(content).toString('base64');

    const response = await fetch(
      `${this.baseUrl}/api/v1/repos/${username}/${repoName}/contents/${filePath}`,
      {
        method: sha ? 'PUT' : 'POST',
        headers: {
          Authorization: `token ${this.adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          branch,
          ...(sha && { sha }), // Include SHA for updates
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create/update file: ${error}`);
    }

    return response.json();
  }

  /**
   * Crear personaje en Gitea (directorio completo)
   */
  async createCharacter(
    username: string,
    characterSlug: string,
    characterData: {
      name: string;
      description: string;
      type: string;
      background: string;
    }
  ) {
    const repoName = 'personajes';
    const basePath = `${characterSlug}`;

    // 1. Crear personaje.json
    await this.createOrUpdateFile(
      username,
      repoName,
      `${basePath}/personaje.json`,
      JSON.stringify(
        {
          name: characterData.name,
          slug: characterSlug,
          type: characterData.type,
          description: characterData.description,
          createdAt: new Date().toISOString(),
        },
        null,
        2
      ),
      `feat: create character ${characterData.name}`
    );

    // 2. Crear historia.md
    await this.createOrUpdateFile(
      username,
      repoName,
      `${basePath}/historia.md`,
      `# ${characterData.name}\n\n${characterData.background || 'Historia pendiente...'}`,
      `docs: add story for ${characterData.name}`
    );

    // 3. Crear README.md en el directorio del personaje
    await this.createOrUpdateFile(
      username,
      repoName,
      `${basePath}/README.md`,
      `# ${characterData.name}\n\n**Tipo**: ${characterData.type}\n\n${characterData.description}`,
      `docs: add README for ${characterData.name}`
    );

    return {
      repoUrl: `${this.baseUrl}/${username}/${repoName}`,
      characterPath: `${username}/${repoName}/src/branch/main/${basePath}`,
    };
  }

  /**
   * Actualizar historia de personaje
   */
  async updateCharacterStory(
    username: string,
    characterSlug: string,
    newContent: string,
    commitMessage: string
  ) {
    const repoName = 'personajes';
    const filePath = `${characterSlug}/historia.md`;

    // Primero obtener el archivo actual para tener su SHA
    const currentFile = await this.getFile(username, repoName, filePath);

    return this.createOrUpdateFile(
      username,
      repoName,
      filePath,
      newContent,
      commitMessage,
      'main',
      currentFile.sha
    );
  }

  /**
   * Obtener archivo de un repo
   */
  async getFile(username: string, repoName: string, filePath: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/repos/${username}/${repoName}/contents/${filePath}`,
      {
        headers: {
          Authorization: `token ${this.adminToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('File not found or error fetching file');
    }

    return response.json();
  }

  /**
   * Obtener historial de commits de un archivo
   */
  async getFileCommits(
    username: string,
    repoName: string,
    filePath: string
  ) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/repos/${username}/${repoName}/commits?path=${filePath}`,
      {
        headers: {
          Authorization: `token ${this.adminToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get commits');
    }

    return response.json();
  }

  /**
   * Fork de un repositorio
   */
  async forkRepository(
    ownerUsername: string,
    repoName: string,
    targetUsername: string
  ): Promise<GiteaRepo> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/repos/${ownerUsername}/${repoName}/forks`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${this.adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization: targetUsername,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fork repository');
    }

    return response.json();
  }

  // Helpers

  private sanitizeUsername(nick: string): string {
    // Gitea username rules: alphanumeric, -, _
    return `usuario-${nick.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}`;
  }

  private generateSecurePassword(): string {
    return crypto.randomBytes(32).toString('base64url');
  }
}

export const giteaService = new GiteaService();
```

#### 2.2 Crear `lib/gitea-encryption.ts`

Para encriptar tokens de usuario antes de guardarlos en PostgreSQL:

```typescript
import crypto from 'crypto';

const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

#### 2.3 Actualizar Schema Prisma

**`prisma/schema.prisma`**:

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  nick              String    @unique
  firstName         String?
  lastName          String?

  // ... otros campos existentes

  // Gitea Integration
  giteaUsername     String?   @unique
  giteaUserId       Int?      @unique
  giteaAccessToken  String?   @db.Text  // Encriptado
  giteaRepoUrl      String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

**Migración**:
```bash
npx prisma migrate dev --name add_gitea_fields
```

#### 2.4 Hook en Registro de Usuario

**`app/api/register/route.ts`** (o donde esté el registro):

```typescript
import { giteaService } from '@/lib/gitea-service';
import { encryptToken } from '@/lib/gitea-encryption';

export async function POST(req: Request) {
  // ... validación y creación de usuario en PostgreSQL

  try {
    // 1. Crear usuario en Gitea
    const giteaUser = await giteaService.createUser(
      newUser.nick,
      newUser.email,
      newUser.firstName && newUser.lastName
        ? `${newUser.firstName} ${newUser.lastName}`
        : undefined
    );

    // 2. Generar token para el usuario
    const giteaToken = await giteaService.generateUserToken(giteaUser.login);

    // 3. Crear repo de personajes
    const charactersRepo = await giteaService.createCharactersRepo(
      giteaUser.login,
      newUser.nick
    );

    // 4. Actualizar usuario en PostgreSQL
    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        giteaUsername: giteaUser.login,
        giteaUserId: giteaUser.id,
        giteaAccessToken: encryptToken(giteaToken),
        giteaRepoUrl: charactersRepo.html_url,
      },
    });

    // 5. (Opcional) Fork del repo oficial
    // await giteaService.forkRepository(
    //   'chocosfera-system',
    //   'historia-oficial',
    //   giteaUser.login
    // );

    return NextResponse.json({
      success: true,
      user: newUser,
      giteaRepo: charactersRepo.html_url
    });
  } catch (error) {
    console.error('Gitea setup failed:', error);
    // Continuar aunque Gitea falle (sistema degradado)
    return NextResponse.json({
      success: true,
      user: newUser,
      warning: 'Git repository creation failed, will retry later'
    });
  }
}
```

#### 2.5 Actualizar API de Personajes

**`app/api/characters/route.ts`** (POST - Crear personaje):

```typescript
import { giteaService } from '@/lib/gitea-service';

export async function POST(req: Request) {
  // ... validación y creación en MongoDB

  try {
    if (user.giteaUsername) {
      // Crear personaje en Gitea
      const giteaResult = await giteaService.createCharacter(
        user.giteaUsername,
        newCharacter.slug,
        {
          name: characterData.name,
          description: characterData.description,
          type: characterData.characterType,
          background: characterData.background || '',
        }
      );

      // Actualizar MongoDB con info de Git
      await charactersCollection.updateOne(
        { _id: newCharacter.insertedId },
        {
          $set: {
            gitRepoUrl: giteaResult.repoUrl,
            lastCommitAt: new Date(),
          },
        }
      );
    }
  } catch (error) {
    console.error('Gitea character creation failed:', error);
    // Character ya está creado en MongoDB, solo falló Gitea
  }

  return NextResponse.json(newCharacter);
}
```

---

### Fase 3: Migración de Datos Existentes (2-3 horas)

#### 3.1 Script de Migración

**`scripts/migrate-to-gitea.ts`**:

```typescript
import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { giteaService } from '../lib/gitea-service';
import { encryptToken } from '../lib/gitea-encryption';

const prisma = new PrismaClient();
const mongoClient = new MongoClient(process.env.MONGODB_URI!);

async function main() {
  await mongoClient.connect();
  const db = mongoClient.db();
  const charactersCollection = db.collection('characters');

  // Obtener todos los usuarios
  const users = await prisma.user.findMany({
    where: {
      giteaUsername: null, // Solo usuarios que no tienen Gitea configurado
    },
  });

  console.log(`Migrating ${users.length} users to Gitea...`);

  for (const user of users) {
    try {
      console.log(`\n👤 Processing user: ${user.nick}`);

      // 1. Crear usuario en Gitea
      const giteaUser = await giteaService.createUser(
        user.nick,
        user.email,
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : undefined
      );
      console.log(`  ✅ Gitea user created: ${giteaUser.login}`);

      // 2. Generar token
      const giteaToken = await giteaService.generateUserToken(giteaUser.login);
      console.log(`  ✅ Token generated`);

      // 3. Crear repo de personajes
      const charactersRepo = await giteaService.createCharactersRepo(
        giteaUser.login,
        user.nick
      );
      console.log(`  ✅ Repo created: ${charactersRepo.html_url}`);

      // 4. Migrar personajes existentes
      const userCharacters = await charactersCollection
        .find({ userId: user.id })
        .toArray();

      console.log(`  📚 Migrating ${userCharacters.length} characters...`);

      for (const character of userCharacters) {
        try {
          await giteaService.createCharacter(giteaUser.login, character.slug, {
            name: character.name,
            description: character.description,
            type: character.characterType,
            background: character.background || '',
          });

          // Actualizar MongoDB
          await charactersCollection.updateOne(
            { _id: character._id },
            {
              $set: {
                gitRepoUrl: `${charactersRepo.html_url}/src/branch/main/${character.slug}`,
                lastCommitAt: new Date(),
              },
            }
          );

          console.log(`    ✅ ${character.name}`);
        } catch (error) {
          console.error(`    ❌ Failed to migrate ${character.name}:`, error);
        }
      }

      // 5. Actualizar usuario en PostgreSQL
      await prisma.user.update({
        where: { id: user.id },
        data: {
          giteaUsername: giteaUser.login,
          giteaUserId: giteaUser.id,
          giteaAccessToken: encryptToken(giteaToken),
          giteaRepoUrl: charactersRepo.html_url,
        },
      });

      console.log(`  ✅ User updated in PostgreSQL`);
    } catch (error) {
      console.error(`❌ Failed to migrate user ${user.nick}:`, error);
    }
  }

  console.log('\n✨ Migration completed!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await mongoClient.close();
  });
```

**Ejecutar migración**:
```bash
# Añadir script a package.json
"scripts": {
  "migrate:gitea": "tsx scripts/migrate-to-gitea.ts"
}

# Ejecutar
npm run migrate:gitea
```

---

### Fase 4: Webhooks (1-2 horas)

#### 4.1 Crear Endpoint de Webhook

**`app/api/webhooks/gitea/route.ts`**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(process.env.MONGODB_URI!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('X-Gitea-Signature');
  const event = req.headers.get('X-Gitea-Event');

  // Verificar firma
  const expectedSignature = crypto
    .createHmac('sha256', process.env.GITEA_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);

  // Procesar según el evento
  switch (event) {
    case 'push':
      await handlePushEvent(payload);
      break;
    case 'pull_request':
      await handlePullRequestEvent(payload);
      break;
    case 'fork':
      await handleForkEvent(payload);
      break;
    default:
      console.log(`Unhandled webhook event: ${event}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePushEvent(payload: any) {
  // Actualizar lastCommitSha en MongoDB cuando hay un push
  const repoFullName = payload.repository.full_name; // usuario-nick/personajes
  const commits = payload.commits || [];

  if (commits.length === 0) return;

  const latestCommit = commits[commits.length - 1];

  await mongoClient.connect();
  const db = mongoClient.db();
  const charactersCollection = db.collection('characters');

  // Actualizar todos los personajes afectados
  for (const commit of commits) {
    for (const file of [...commit.added, ...commit.modified]) {
      if (file.startsWith('characters/') && file.endsWith('historia.md')) {
        const slug = file.split('/')[1]; // characters/{slug}/historia.md

        await charactersCollection.updateOne(
          { slug, gitRepoUrl: { $regex: repoFullName } },
          {
            $set: {
              lastCommitSha: commit.id,
              lastCommitMessage: commit.message,
              lastCommitAt: new Date(commit.timestamp),
            },
          }
        );
      }
    }
  }
}

async function handlePullRequestEvent(payload: any) {
  // Crear notificación para el usuario
  console.log('PR event:', payload.action, payload.pull_request.title);
  // TODO: Implementar notificaciones
}

async function handleForkEvent(payload: any) {
  // Registrar fork en la base de datos
  console.log('Repo forked:', payload.repository.full_name);
  // TODO: Actualizar stats de forks
}
```

#### 4.2 Configurar Webhook en Gitea

**Vía UI**:
1. Ir a Gitea Admin Panel → System Webhooks
2. Add Webhook → Gitea
3. Target URL: `https://app.chocosfera.com/api/webhooks/gitea`
4. Secret: (valor de `GITEA_WEBHOOK_SECRET`)
5. Trigger On: Push, Pull Request, Fork, Repository
6. Active: ✅

**Vía API**:
```bash
curl -X POST "${GITEA_URL}/api/v1/admin/hooks" \
  -H "Authorization: token ${GITEA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "gitea",
    "config": {
      "url": "https://app.chocosfera.com/api/webhooks/gitea",
      "content_type": "json",
      "secret": "'${GITEA_WEBHOOK_SECRET}'"
    },
    "events": ["push", "pull_request", "fork", "repository"],
    "active": true
  }'
```

---

## 🧪 Testing

### Test Manual Post-Migración

```bash
# 1. Verificar Gitea está corriendo
curl http://localhost:3001/api/v1/version

# 2. Crear usuario de prueba
# (Registrarse en la app)

# 3. Verificar usuario en Gitea
curl -H "Authorization: token ${GITEA_API_TOKEN}" \
     http://localhost:3001/api/v1/users/usuario-test

# 4. Verificar repo creado
curl -H "Authorization: token ${GITEA_API_TOKEN}" \
     http://localhost:3001/api/v1/repos/usuario-test/personajes

# 5. Crear personaje
# (Usar la UI de la app)

# 6. Verificar archivo en Gitea
curl -H "Authorization: token ${GITEA_API_TOKEN}" \
     http://localhost:3001/api/v1/repos/usuario-test/personajes/contents/{slug}/historia.md

# 7. Verificar commits
curl -H "Authorization: token ${GITEA_API_TOKEN}" \
     http://localhost:3001/api/v1/repos/usuario-test/personajes/commits
```

---

## ⚠️ Consideraciones Importantes

### Seguridad
- ✅ Tokens encriptados en PostgreSQL
- ✅ Webhooks firmados con HMAC
- ✅ Registro deshabilitado en Gitea (solo vía API)
- ⚠️ En producción, usar HTTPS para Gitea
- ⚠️ Backups regulares de datos de Gitea

### Performance
- 💡 Operaciones Git pueden ser lentas → usar jobs async
- 💡 Considerar queue (BullMQ) para commits
- 💡 Cache de datos de Gitea en MongoDB

### Rollback Plan
Si algo falla:
1. Sistema actual funciona sin Gitea (modo degradado)
2. Git local sigue funcionando como backup
3. Migración puede repetirse (es idempotente)

---

## 📝 Checklist de Implementación

### Setup
- [ ] Crear `docker-compose.gitea.yml`
- [ ] Levantar Gitea: `docker-compose -f docker-compose.gitea.yml up -d`
- [ ] Crear usuario admin
- [ ] Generar token API
- [ ] Añadir variables de entorno a `.env.local`
- [ ] Generar `ENCRYPTION_KEY`

### Código
- [ ] Crear `lib/gitea-service.ts`
- [ ] Crear `lib/gitea-encryption.ts`
- [ ] Actualizar schema Prisma (añadir campos Gitea)
- [ ] Ejecutar migración Prisma
- [ ] Actualizar API de registro
- [ ] Actualizar API de personajes (POST)
- [ ] Actualizar API de personajes (PATCH)

### Migración de Datos
- [ ] Crear `scripts/migrate-to-gitea.ts`
- [ ] Probar migración en dev
- [ ] Ejecutar migración de usuarios existentes
- [ ] Verificar datos en Gitea

### Webhooks
- [ ] Crear `app/api/webhooks/gitea/route.ts`
- [ ] Configurar webhook en Gitea
- [ ] Probar eventos de webhook

### Testing
- [ ] Test: Registro de nuevo usuario
- [ ] Test: Creación de personaje
- [ ] Test: Edición de historia
- [ ] Test: Webhook push
- [ ] Test: Ver historia en Gitea UI

---

**Tiempo Estimado Total**: 8-12 horas
**Nivel de Dificultad**: Alto ⭐⭐⭐⭐
**Prioridad**: 🔴 Crítica

---

**Próximos pasos después de Gitea**:
1. Crear repo oficial `historia-oficial` en GitHub
2. Importar repo oficial a Gitea
3. Implementar sistema de forks
4. Implementar sistema de pull requests
5. UI para ver grafos de Git
