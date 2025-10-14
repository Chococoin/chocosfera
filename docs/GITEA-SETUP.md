# Gitea Setup & Configuration

## 📖 Visión General

Gitea es nuestro servidor Git auto-hospedado que permite a cada usuario de la Chocósfera tener su propio repositorio de personajes. Los usuarios pueden crear historias, colaborar mediante forks y pull requests, y aprender conceptos de control de versiones de manera práctica.

## 🎯 Propósito en la Chocósfera

- **Trazabilidad**: Cada cambio en la historia de un personaje queda registrado
- **Colaboración**: Familias y alianzas pueden colaborar mediante PRs
- **Educación**: Enseñar Git, open source, y colaboración de forma práctica
- **Ownership**: Cada usuario es dueño de su repositorio y personajes

## 🚀 Instalación

### Opción 1: Docker (Recomendado para desarrollo)

```bash
# docker-compose.yml
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
      - GITEA__server__ROOT_URL=http://git.chocosfera.local:3000
      - GITEA__server__DOMAIN=git.chocosfera.local
      - GITEA__server__HTTP_PORT=3000
      - GITEA__security__INSTALL_LOCK=true
      - GITEA__service__DISABLE_REGISTRATION=true  # Solo registro via API
    restart: always
    volumes:
      - gitea_data:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
    depends_on:
      - db

  db:
    image: postgres:14
    restart: always
    environment:
      - POSTGRES_USER=gitea
      - POSTGRES_PASSWORD=gitea_password
      - POSTGRES_DB=gitea
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  gitea_data:
  postgres_data:
```

```bash
# Iniciar Gitea
docker-compose up -d

# Ver logs
docker-compose logs -f gitea
```

### Opción 2: Instalación Binaria

```bash
# Descargar Gitea
wget -O gitea https://dl.gitea.com/gitea/1.21/gitea-1.21-linux-amd64
chmod +x gitea

# Crear usuario del sistema
sudo adduser --system --shell /bin/bash --group --disabled-password --home /home/git git

# Crear directorios
sudo mkdir -p /var/lib/gitea/{custom,data,log}
sudo chown -R git:git /var/lib/gitea/
sudo chmod -R 750 /var/lib/gitea/

# Crear archivo de configuración
sudo mkdir -p /etc/gitea
sudo chown root:git /etc/gitea
sudo chmod 770 /etc/gitea

# Iniciar Gitea
sudo -u git ./gitea web --config /etc/gitea/app.ini
```

## ⚙️ Configuración Inicial

### 1. Crear Usuario Administrador

```bash
# Via CLI
docker exec -it chocosfera-gitea gitea admin user create \
  --username chocosfera_admin \
  --password <strong-password> \
  --email admin@chocosfera.com \
  --admin

# O visitar http://git.chocosfera.local:3000/install
```

### 2. Configurar API Token

```bash
# Generar token para la aplicación Next.js
docker exec -it chocosfera-gitea gitea admin user generate-access-token \
  -u chocosfera_admin \
  --name "nextjs-app" \
  --scopes "write:repository,write:user,write:organization"
```

Guardar el token en `.env.local`:
```bash
GITEA_URL=http://git.chocosfera.local:3000
GITEA_API_TOKEN=<token-generado>
GITEA_ADMIN_USERNAME=chocosfera_admin
```

### 3. Configurar Webhooks

En Gitea Admin Panel → System Webhooks:

**Webhook URL**: `https://app.chocosfera.com/api/webhooks/gitea`

**Eventos**:
- ✅ Push
- ✅ Pull Request
- ✅ Repository

**Content Type**: `application/json`

**Secret**: (generar y guardar en `.env.local`)

## 🏗️ Estructura de Organizaciones

### Sistema de Organizaciones

```
chocosfera-system/          # Organización del sistema
├── historia-oficial/       # Fork del repo de GitHub
├── personajes-oficiales/   # Tony, Pipo, Kaoka

usuario-{nick}/             # Repos personales
└── personajes/             # Repo de personajes del usuario

familia-{name}/             # Organizaciones familiares
├── personajes-familia/     # Personajes colaborativos
└── proyectos-especiales/   # Proyectos conjuntos

alianza-{name}/             # Alianzas entre familias
└── eventos-colaborativos/  # Eventos y proyectos de la alianza
```

## 🔐 Permisos y Visibilidad

### Repos de Usuario
- **Private** por defecto
- Usuario puede hacerlos **Public**
- Familia tiene acceso **Read** si está vinculado
- Sistema tiene acceso **Admin** (para mantenimiento)

### Repos de Familia
- **Private** por defecto
- Todos los miembros tienen acceso **Write**
- Creador tiene acceso **Admin**
- Pueden invitar colaboradores externos

### Repos de Alianza
- **Public** o **Private** según configuración
- Representantes de familias tienen **Write**
- Miembros tienen **Read**

## 📡 API Usage

### Crear Usuario en Gitea

```typescript
const response = await fetch(`${GITEA_URL}/api/v1/admin/users`, {
  method: 'POST',
  headers: {
    'Authorization': `token ${GITEA_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: `usuario-${userNick}`,
    email: userEmail,
    password: generatedPassword,
    must_change_password: false,
    send_notify: false,
  }),
});
```

### Crear Repositorio

```typescript
const response = await fetch(
  `${GITEA_URL}/api/v1/user/repos`,
  {
    method: 'POST',
    headers: {
      'Authorization': `token ${userGiteaToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'personajes',
      description: `Personajes de ${userNick} en la Chocósfera`,
      private: true,
      auto_init: true,
      readme: 'Default',
      default_branch: 'main',
    }),
  }
);
```

### Fork del Repo Oficial

```typescript
const response = await fetch(
  `${GITEA_URL}/api/v1/repos/chocosfera-system/historia-oficial/forks`,
  {
    method: 'POST',
    headers: {
      'Authorization': `token ${userGiteaToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      organization: `usuario-${userNick}`,
    }),
  }
);
```

## 🔄 Flujo de Trabajo

### 1. Nuevo Usuario se Registra
1. App crea usuario en PostgreSQL
2. App crea usuario en Gitea
3. App genera token para el usuario
4. App crea repo `personajes` para el usuario
5. App hace fork del repo oficial

### 2. Usuario Crea Personaje
1. App crea estructura de directorios
2. App crea `personaje.json` con metadata
3. App hace commit inicial
4. App actualiza MongoDB con referencia Git

### 3. Usuario Edita Historia
1. Usuario escribe en el editor
2. App guarda cambios en archivo
3. App hace commit con mensaje descriptivo
4. App actualiza lastCommitSha en MongoDB

### 4. Usuario Hace Fork de Tony
1. Usuario clona estructura de Tony
2. App crea nuevo personaje basado en Tony
3. App registra `forkedFrom` en MongoDB
4. Usuario puede proponer cambios via PR

## 🛠️ Mantenimiento

### Backup de Repos

```bash
# Backup automático diario
docker exec chocosfera-gitea gitea dump -c /data/gitea/conf/app.ini

# Backup manual
rsync -av /path/to/gitea/data/ /path/to/backup/
```

### Monitoreo

```bash
# Ver estadísticas
docker exec chocosfera-gitea gitea manager show-stats

# Ver usuarios activos
docker exec chocosfera-gitea gitea manager list-users
```

### Limpieza

```bash
# Limpiar repos sin actividad por 1 año
docker exec chocosfera-gitea gitea admin cleanup-repos --older-than 365d
```

## 🐛 Troubleshooting

### Problema: Usuario no puede hacer push
```bash
# Verificar permisos
docker exec chocosfera-gitea gitea admin auth list

# Regenerar keys SSH
docker exec -u git chocosfera-gitea gitea admin regenerate keys
```

### Problema: Webhook no funciona
```bash
# Ver logs de webhooks
docker exec chocosfera-gitea gitea admin hook list

# Testear webhook
curl -X POST http://git.chocosfera.local:3000/api/v1/repos/{owner}/{repo}/hooks/{id}/test
```

## 📚 Referencias

- [Gitea Documentation](https://docs.gitea.com/)
- [Gitea API](https://docs.gitea.com/api/1.21/)
- [Gitea Docker](https://docs.gitea.com/installation/install-with-docker)

## 🔮 Roadmap

- [ ] Implementar CI/CD con Gitea Actions
- [ ] Sistema de badges para contribuidores
- [ ] Integración con visualizador de grafos Git
- [ ] Panel de estadísticas de colaboración
- [ ] Sistema de templates para nuevos personajes
