export interface Product {
  id: string;
  name: string;
  type: 'nft' | 'book' | 'plush' | 'chocolate' | 'trees';
  priceEUR: number;
  priceCoins: number;
  image: string;
  creator: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  character: string;
  stock?: number;
  sold?: number;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Rarity {
  id: string;
  name: string;
  color: string;
}

export type PaymentMode = 'fiat' | 'chococoins';
