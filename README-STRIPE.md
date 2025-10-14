# Guía de Integración Stripe Multi-Moneda para Chocósfera

Esta guía te ayudará a configurar y usar el sistema de pagos Stripe con soporte multi-moneda para la plataforma Chocósfera.

## 📋 Índice

1. [Prerequisitos](#prerequisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Crear Productos Automáticamente](#crear-productos-automáticamente)
4. [Verificar Configuración](#verificar-configuración)
5. [Probar Pagos](#probar-pagos)
6. [Webhooks](#webhooks)
7. [Agregar Nuevas Monedas](#agregar-nuevas-monedas)
8. [FAQ](#faq)

---

## Prerequisitos

- Cuenta de Stripe (modo test): https://dashboard.stripe.com/register
- Node.js 18+ instalado
- Stripe CLI instalado (para webhooks locales)

---

## Configuración Inicial

### 1. Obtener Credenciales de Stripe

1. Ve a https://dashboard.stripe.com/test/apikeys
2. Copia las siguientes keys:
   - **Publishable key** (comienza con `pk_test_...`)
   - **Secret key** (comienza con `sk_test_...`)

### 2. Configurar Webhook Local

Para probar webhooks en desarrollo local:

```bash
# Instalar Stripe CLI
brew install stripe/stripe-brew/stripe  # macOS
# O descarga desde: https://stripe.com/docs/stripe-cli

# Login a Stripe
stripe login

# Iniciar webhook listener en puerto 4242
stripe listen --forward-to localhost:3000/api/stripe/webhook --port 4242
```

El comando mostrará el **webhook signing secret** (comienza con `whsec_...`). Cópialo.

### 3. Actualizar .env.local

Tu archivo `.env.local` ya debería tener las keys. Verifica que estén correctas:

```env
# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Crear Productos Automáticamente

### Ejecutar el Script de Setup

Este script creará automáticamente todos los productos y precios en Stripe:

```bash
npm run stripe:setup
```

**El script hará lo siguiente:**

1. Conectarse a tu cuenta de Stripe
2. Crear 6 productos:
   - **Seed Sprout** (€2.99/mes)
   - **Seed Seedling** (€4.99/mes)
   - **Seed Sapling** (€9.99/mes)
   - **Fruit Cacao Pod** (€15.99/mes)
   - **Fruit Cacao Grove** (€39.99/mes)
   - **Fruit Cacao Forest** (€89.99/mes)

3. Para cada producto, crear 5 precios (una por cada moneda):
   - **EUR** (€) - Euro
   - **USD** ($) - Dólar estadounidense
   - **GBP** (£) - Libra esterlina
   - **JPY** (¥) - Yen japonés
   - **CNY** (¥) - Yuan chino

4. Actualizar `.env.local` con todos los Price IDs generados

### Salida Esperada

```bash
🚀 Chocósfera Stripe Setup

========================================
Creating products and prices in Stripe...
========================================

📦 Creating product: Seed - Sprout...
   ✓ Product created (prod_...)

💰 Creating prices for Seed - Sprout...
   ✓ EUR: 2.99 (price_...)
   ✓ USD: 3.23 (price_...)
   ✓ GBP: 2.57 (price_...)
   ✓ JPY: 487 (price_...)
   ✓ CNY: 23.48 (price_...)

...

📝 Updating .env.local...
   ✓ .env.local updated

========================================
✅ Setup completed successfully!
========================================

📋 Summary:
   • 6 products created/verified
   • 5 currencies per product
   • Total prices: 30

🎉 Your Stripe account is now ready to accept payments!
```

---

## Verificar Configuración

### 1. Ver Productos en Stripe Dashboard

1. Ve a https://dashboard.stripe.com/test/products
2. Deberías ver 6 productos con sus precios multi-moneda

### 2. Ver Price IDs en .env.local

Tu `.env.local` ahora debería tener una nueva variable `STRIPE_PRICE_IDS` con estructura JSON:

```env
STRIPE_PRICE_IDS='{"seed-sprout":{"EUR":"price_...","USD":"price_...","GBP":"price_..."...}...}'
```

### 3. Reiniciar Servidor de Desarrollo

```bash
# Detener servidor actual (Ctrl+C)
npm run dev
```

---

## Probar Pagos

### 1. Ir a la Página de Pricing

```bash
http://localhost:3000/es/pricing
```

### 2. Verificar Detección de Moneda

La página debería mostrar precios en **EUR (€)** para el locale español:

- Seed Sprout: **€2,99/mes**
- Seed Seedling: **€4,99/mes**
- etc.

Si cambias a locale inglés (`/en/pricing`), verás precios en **USD ($)**:

- Seed Sprout: **$3.23/mes**
- etc.

### 3. Probar Checkout

1. Haz clic en "Suscribirse ahora" en cualquier plan
2. Se creará una sesión de checkout (verás el sessionId en un alert)
3. La integración con Stripe Checkout se completará próximamente

### 4. Tarjetas de Prueba

Cuando implementes Stripe Checkout completo, usa estas tarjetas de prueba:

- **Éxito**: `4242 4242 4242 4242`
- **Requiere autenticación**: `4000 0025 0000 3155`
- **Rechazada**: `4000 0000 0000 9995`

Fecha de expiración: Cualquier fecha futura
CVV: Cualquier 3 dígitos
Código postal: Cualquier 5 dígitos

---

## Webhooks

### Eventos Configurados

El webhook en `/api/stripe/webhook` maneja estos eventos:

- `checkout.session.completed` - Pago completado
- `customer.subscription.created` - Nueva suscripción
- `customer.subscription.updated` - Suscripción actualizada
- `customer.subscription.deleted` - Suscripción cancelada
- `invoice.payment_succeeded` - Pago mensual exitoso
- `invoice.payment_failed` - Pago fallido

### Webhook en Producción

Cuando despliegues a producción:

1. Ve a https://dashboard.stripe.com/test/webhooks/create
2. Agrega endpoint: `https://tudominio.com/api/stripe/webhook`
3. Selecciona los eventos listados arriba
4. Copia el webhook secret y actualiza `.env.production`

---

## Agregar Nuevas Monedas

### 1. Actualizar Configuración de Moneda

Edita `lib/currency-config.ts`:

```typescript
// Agregar nueva moneda
export const currencies: Record<SupportedCurrency, CurrencyInfo> = {
  // ... existentes
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    decimalPlaces: 2,
    locale: 'es-MX',
  },
};

// Agregar mapeo de locale
export const localeToCurrency: Record<SupportedLocale, SupportedCurrency> = {
  // ... existentes
  'es-MX': 'MXN',
};

// Agregar tasa de conversión
export const conversionRates: Record<SupportedCurrency, number> = {
  // ... existentes
  MXN: 21.5, // 1 EUR = 21.5 MXN
};
```

### 2. Actualizar Script de Setup

Edita `scripts/setup-stripe-products.ts` y agrega MXN al objeto `currencies`.

### 3. Re-ejecutar Script

```bash
npm run stripe:setup
```

El script creará automáticamente precios para la nueva moneda.

---

## FAQ

### ¿Cómo cambio los precios base?

Edita `lib/pricing-plans.ts` y modifica los valores `priceEUR`. Luego ejecuta `npm run stripe:setup` de nuevo.

### ¿Puedo usar el mismo precio en todas las monedas?

Sí. En lugar de usar tasas de conversión, puedes establecer precios fijos. Modifica la función `convertPrice` en `currency-config.ts`.

### ¿Cómo pruebo diferentes monedas sin cambiar el locale?

Puedes pasar un parámetro `currency` manualmente en la URL (requiere modificar el código).

### ¿Los webhooks funcionan en desarrollo local?

Sí, si tienes Stripe CLI corriendo con:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### ¿Qué pasa si el script falla a medio camino?

El script es idempotent - puedes ejecutarlo múltiples veces. Si un producto ya existe, lo reutilizará en lugar de crear uno nuevo.

### ¿Cómo borro todos los productos y empiezo de nuevo?

1. Ve a https://dashboard.stripe.com/test/products
2. Archiva todos los productos
3. Ejecuta `npm run stripe:setup` de nuevo

### ¿Necesito crear webhooks para cada moneda?

No. Los webhooks son independientes de la moneda. Un mismo webhook maneja pagos en todas las monedas.

---

## 🎉 ¡Listo!

Tu sistema de pagos multi-moneda está configurado. Los usuarios verán precios en su moneda local según su idioma, y Stripe procesará los pagos en esa moneda.

**Próximos pasos:**
- Implementar redirección a Stripe Checkout
- Configurar lógica de negocio en webhooks
- Probar flujo completo de pago
- Configurar webhooks de producción

**Documentación adicional:**
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Multi-currency Pricing](https://stripe.com/docs/currencies)
