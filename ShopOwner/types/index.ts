// types/index.ts

// -------------------------
// Common Types & Enums
// -------------------------
export type AccountType = 'customer' | 'shopOwner';
export type PackingStatus = 'pending' | 'processing' | 'completed';
export type PackingStatusMap = Record<string, PackingStatus>;

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'si' | 'ta';

// -------------------------
// Shop Type
// -------------------------
export interface Shop {
  id: number | string;

  owner_id?: number;
  shop_name?: string;
  shop_address?: string;
  shop_category?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  image?: string | null;
  is_open?: boolean | null;
  rating?: number | null;
  offers?: string[] | string | null;
  created_at?: string;

  // Frontend aliases
  name?: string; // alias for shop_name
  address?: string; // alias for shop_address
  category?: string; // alias for shop_category

  distance?: number;
  distanceKm?: number;
  isOpen?: boolean;
}

// -------------------------
// Product Type
// -------------------------
export interface Product {
  id: number | string;

  name: string;
  price: number;

  category?: string | null;
  unit?: string;

  unit_type?: string | null;
  quantity?: string | number | null;
  stock?: number | null;
  product_image?: string | null;

  availability?: 'available' | 'in_stock' | 'out_of_stock' | 'low_stock';

  image?: string;
  shop_id?: number;
  shopId?: number | string;
  created_at?: string;

  shop?: Shop; // optionally included
}

// -------------------------
// User Type (used in AuthContext)
// -------------------------
export interface User {
  id: number | string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'SHOP_OWNER';

  phone?: string;
  address?: string;
  avatar?: string;

  shop?: Shop; // if role == SHOP_OWNER
}

// -------------------------
// Shopping Item (used in Pre-Bill)
// -------------------------
export interface ShoppingListItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

// -------------------------
// App Settings (used in AppContext)
// -------------------------
export interface AppSettings {
  theme: Theme;
  language: Language;
  notifications: boolean;
}

export interface Offer {
  id: number;
  shop_id: number;
  title: string;
  description: string;
  banner_image_url: string;
  is_active: boolean;
  created_at: string;
}
