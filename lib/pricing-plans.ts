import type { SupportedCurrency } from './currency-config';

export interface PricingPlan {
  id: string;
  name: string;
  priceEUR: number; // Base price in EUR
  interval: 'month' | 'year';
  stripePriceIds?: Partial<Record<SupportedCurrency, string>>;
  features: string[];
  popular?: boolean;
  icon: string;
  color: string;
  chococoins?: number;
  trees?: number;
  discount?: number;
  customChocolate?: boolean;
}

export interface PricingScheme {
  id: 'seed' | 'fruit';
  name: string;
  description: string;
  tagline: string;
  icon: string;
  plans: PricingPlan[];
}

export const pricingSchemes: PricingScheme[] = [
  {
    id: 'seed',
    name: 'Seed',
    description: 'Para early adopters que quieren apoyar el proyecto y estar al tanto de su evolución',
    tagline: 'Planta la semilla del cambio',
    icon: '🌱',
    plans: [
      {
        id: 'seed-sprout',
        name: 'Sprout',
        priceEUR: 2.99,
        interval: 'month',
        stripePriceIds: {},
        icon: '🌱',
        color: 'green',
        features: [
          'Newsletter mensual exclusivo',
          'Acceso anticipado a nuevas funciones',
          'Badge de Early Adopter',
          'Grupo de Telegram VIP',
          '50 ChocoCoins de bienvenida',
        ],
      },
      {
        id: 'seed-seedling',
        name: 'Seedling',
        priceEUR: 4.99,
        interval: 'month',
        stripePriceIds: {},
        icon: '🌿',
        color: 'emerald',
        popular: true,
        features: [
          'Todo lo de Sprout',
          'Acceso a beta privada de funciones',
          'Llamada mensual con el equipo',
          'Voto en decisiones de producto',
          '100 ChocoCoins de bienvenida',
          '10% descuento en marketplace',
        ],
      },
      {
        id: 'seed-sapling',
        name: 'Sapling',
        priceEUR: 9.99,
        interval: 'month',
        stripePriceIds: {},
        icon: '🌳',
        color: 'teal',
        features: [
          'Todo lo de Seedling',
          'Sesión 1-on-1 trimestral con fundadores',
          'Reconocimiento en página de patrocinadores',
          'Prioridad en soporte',
          '200 ChocoCoins de bienvenida',
          '20% descuento en marketplace',
          'Invitación a eventos exclusivos',
        ],
      },
    ],
  },
  {
    id: 'fruit',
    name: 'Fruit',
    description: 'Adopta árboles de cacao, gana ChocoCoins y disfruta de productos exclusivos',
    tagline: 'Cosecha los frutos de tu inversión',
    icon: '🍫',
    plans: [
      {
        id: 'fruit-cacao',
        name: 'Cacao Pod',
        priceEUR: 15.99,
        interval: 'month',
        stripePriceIds: {},
        icon: '🌰',
        color: 'amber',
        trees: 1,
        chococoins: 50,
        discount: 10,
        features: [
          '1 árbol de cacao adoptado',
          'Certificado digital de participación',
          '50 ChocoCoins mensuales',
          '10% descuento permanente en productos físicos',
          'Trazabilidad completa de tu árbol',
          'Actualizaciones fotográficas mensuales',
          'Impacto ambiental medido y certificado',
        ],
      },
      {
        id: 'fruit-grove',
        name: 'Cacao Grove',
        priceEUR: 39.99,
        interval: 'month',
        stripePriceIds: {},
        icon: '🍫',
        color: 'orange',
        popular: true,
        trees: 3,
        chococoins: 150,
        discount: 20,
        customChocolate: true,
        features: [
          '3 árboles de cacao adoptados',
          'Certificados digitales NFT',
          '150 ChocoCoins mensuales',
          '20% descuento permanente en productos físicos',
          '1 tableta personalizada anual GRATIS',
          'Diseño de personaje exclusivo',
          'Productos del cacao de tus árboles',
          'Visita virtual trimestral a la plantación',
        ],
      },
      {
        id: 'fruit-forest',
        name: 'Cacao Forest',
        priceEUR: 89.99,
        interval: 'month',
        stripePriceIds: {},
        icon: '🌳',
        color: 'brown',
        trees: 10,
        chococoins: 500,
        discount: 30,
        customChocolate: true,
        features: [
          '10 árboles de cacao adoptados',
          'Certificados digitales NFT premium',
          '500 ChocoCoins mensuales',
          '30% descuento permanente en productos físicos',
          '3 tabletas personalizadas anuales GRATIS',
          'Línea de productos con tu marca personal',
          'Envío mensual de productos premium',
          'Visita física anual a tu plantación',
          'Participación en ganancias de cosecha',
          'Consultoría en sostenibilidad',
        ],
      },
    ],
  },
];

export function getPlanById(planId: string): PricingPlan | undefined {
  for (const scheme of pricingSchemes) {
    const plan = scheme.plans.find((p) => p.id === planId);
    if (plan) return plan;
  }
  return undefined;
}

export function getSchemeByPlanId(planId: string): PricingScheme | undefined {
  return pricingSchemes.find((scheme) =>
    scheme.plans.some((p) => p.id === planId)
  );
}
