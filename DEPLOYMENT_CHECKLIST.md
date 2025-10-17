# Deployment Checklist

Usa este checklist para asegurarte de que todo está configurado antes de deployar a Vercel.

## 📋 Pre-Deployment

### Bases de Datos en la Nube
- [ ] PostgreSQL cloud configurado (Neon/Supabase/Railway)
- [ ] MongoDB Atlas configurado
- [ ] Datos locales exportados (si es necesario)
- [ ] Schema de Prisma pusheado a PostgreSQL cloud
- [ ] Datos importados a las bases de datos cloud
- [ ] Conexiones probadas localmente

**📖 Guía detallada**: [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md)

### Generar Secretos de Producción
- [ ] JWT_SECRET generado para producción
  ```bash
  npm run generate:jwt
  ```
- [ ] TELEGRAM_WEBHOOK_SECRET generado (si usas Telegram)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Stripe Configuración
- [ ] Productos creados en Stripe Dashboard
- [ ] Price IDs copiados de `.env.local`
- [ ] Webhook endpoint preparado (se configurará post-deployment)

## 🚀 Deployment

### 1. Preparar Código
- [ ] Branch `main` actualizado con cambios de producción
- [ ] Build local exitoso (`npm run build`)
- [ ] Código pusheado a GitHub
  ```bash
  git push origin main
  ```

### 2. Importar a Vercel
- [ ] Proyecto importado desde GitHub en vercel.com
- [ ] Framework detectado correctamente (Next.js)

### 3. Variables de Entorno en Vercel

Configurar en: **Project Settings → Environment Variables**

#### Bases de Datos (CRÍTICO)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `MONGODB_URI` - MongoDB Atlas connection string

#### JWT & Sesiones (CRÍTICO)
- [ ] `JWT_SECRET` - Secreto generado con `npm run generate:jwt`
- [ ] `JWT_EXPIRES_IN` - "7d"
- [ ] `SESSION_COOKIE_NAME` - "chocosfera_session"

#### Stripe (CRÍTICO)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET` (actualizar después del primer deploy)
- [ ] `NEXT_PUBLIC_STRIPE_SEED_SPROUT_PRICE_ID`
- [ ] `NEXT_PUBLIC_STRIPE_SEED_SEEDLING_PRICE_ID`
- [ ] `NEXT_PUBLIC_STRIPE_SEED_SAPLING_PRICE_ID`
- [ ] `NEXT_PUBLIC_STRIPE_FRUIT_CACAO_PRICE_ID`
- [ ] `NEXT_PUBLIC_STRIPE_FRUIT_GROVE_PRICE_ID`
- [ ] `NEXT_PUBLIC_STRIPE_FRUIT_FOREST_PRICE_ID`
- [ ] `STRIPE_PRICE_IDS` - JSON completo de `.env.local`

#### App Configuration (CRÍTICO)
- [ ] `NEXT_PUBLIC_APP_URL` - Tu dominio de Vercel (ej: https://chocosfera.vercel.app)

#### Email (Opcional)
- [ ] `MAILERSEND_API_KEY` (si usas email)
- [ ] `MAILERSEND_FROM_EMAIL`
- [ ] `MAILERSEND_FROM_NAME`

#### Telegram (Opcional)
- [ ] `TELEGRAM_BOT_TOKEN` (si usas Telegram)
- [ ] `TELEGRAM_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_TELEGRAM_CHANNEL`

#### Git/Gitea (No necesario para el primer deploy)
- [ ] Puedes omitir las variables de Gitea por ahora

### 4. Deploy
- [ ] Click en "Deploy" en Vercel
- [ ] Esperar build (~2-5 minutos)
- [ ] Verificar que no hay errores en los logs

## ✅ Post-Deployment

### 1. Verificar Deployment
- [ ] Visitar la URL de Vercel
- [ ] Homepage carga correctamente
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Dashboard es accesible

### 2. Configurar Stripe Webhooks
1. [ ] Ir a https://dashboard.stripe.com/webhooks
2. [ ] Agregar endpoint: `https://tu-dominio.vercel.app/api/stripe/webhook`
3. [ ] Seleccionar eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - (Agregar los que necesites)
4. [ ] Copiar el webhook secret
5. [ ] Actualizar `STRIPE_WEBHOOK_SECRET` en Vercel
6. [ ] Redeploy (si es necesario)

### 3. Configurar Telegram Webhook (si aplica)
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://tu-dominio.vercel.app/api/telegram/webhook"}'
```
- [ ] Webhook configurado exitosamente
- [ ] Verificar que el bot responde

### 4. Prisma Database (si no lo hiciste antes)
```bash
# Configurar DATABASE_URL temporalmente
export DATABASE_URL="tu-connection-string-de-vercel"

# Correr migraciones
npx prisma migrate deploy
```
- [ ] Migraciones aplicadas exitosamente
- [ ] Base de datos tiene las tablas correctas

### 5. Testing en Producción
- [ ] Crear cuenta de prueba
- [ ] Login/Logout funciona
- [ ] Crear personaje funciona
- [ ] Cargar familia funciona (si aplica)
- [ ] Dashboard carga correctamente
- [ ] Navegación entre páginas funciona
- [ ] Imágenes se cargan correctamente
- [ ] i18n funciona (cambiar idioma)

### 6. Monitoreo
- [ ] Configurar Vercel Analytics (opcional)
- [ ] Revisar logs de Vercel para errores
- [ ] Configurar alertas de Stripe
- [ ] Monitorear conexiones a base de datos

## 🔧 Troubleshooting

### Build Fails
- Revisar logs en Vercel Dashboard
- Verificar que `postinstall` script corrió
- Verificar que `DATABASE_URL` está configurado

### 500 Error en producción
- Revisar Function Logs en Vercel
- Verificar conexiones a base de datos
- Verificar que todas las variables de entorno están configuradas

### Prisma Errors
- Asegurar que `DATABASE_URL` tiene `?sslmode=require`
- Verificar que el schema está actualizado
- Correr `npx prisma generate` localmente

### Stripe Webhooks no funcionan
- Verificar URL del webhook
- Verificar que `STRIPE_WEBHOOK_SECRET` coincide
- Revisar logs en Stripe Dashboard

## 📊 Success Metrics

Después del deployment, verifica:
- [ ] Uptime: 99%+ (Vercel Status)
- [ ] Build time: < 3 minutos
- [ ] Response time: < 500ms (para páginas principales)
- [ ] No errores en Vercel Function Logs
- [ ] Database connections: < 100ms latency

## 🎉 Deployment Complete!

Una vez completado este checklist:
- [ ] Documentar la URL de producción
- [ ] Compartir con el equipo
- [ ] Configurar dominio custom (opcional)
- [ ] Configurar SSL/HTTPS (Vercel lo hace automáticamente)

---

**📖 Guías detalladas**:
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Guía completa de deployment
- [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md) - Migración de bases de datos

**🆘 Soporte**:
- Vercel: https://vercel.com/support
- Stripe: https://support.stripe.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas/support
