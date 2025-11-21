// types/index.ts

// --------------------
// Common Enumerations
// --------------------
export type AccountType = 'customer' | 'shopOwner';
export type PackingStatus = 'pending' | 'processing' | 'completed';
export type PackingStatusMap = Record<string, PackingStatus>;

// --------------------
// Shop Entity
// --------------------
export interface Shop {
  id: number | string;

  // ---- Backend fields ----
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

  // ---- Derived / frontend fields (aliases) ----
  name?: string; // ← mapped from shop_name
  address?: string; // ← mapped from shop_address
  category?: string | null; // ← mapped from shop_category

  // ---- Runtime / computed fields ----
  distance?: number;
  distanceKm?: number;
  isOpen?: boolean;
}

// --------------------
// Product Entity
// --------------------
export interface Product {
  id: number | string;

  // Some components refer to shopId (mock), backend returns shop_id
  shopId?: number | string;
  shop_id?: number;

  name: string;
  category?: string | null;
  price: number;

  // Legacy single-field unit (mock)
  unit?: string;

  // Backend fields
  unit_type?: string | null;
  quantity?: string | number | null;
  stock?: number | null;
  product_image?: string | null;

  // Extra UI helpers
  availability?: 'available' | 'in_stock' | 'out_of_stock' | 'low_stock';

  // Legacy support
  image?: string;

  shop?: Shop; // ✅ ADDED → for modal & detailed views
  created_at?: string;
}

// --------------------
// Shopping List
// --------------------
export interface ShoppingListItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

// --------------------
// User Profile
// --------------------
export interface UserProfile {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string; // ✅ Add this
  address?: string; // ✅ Add this
  accountType?: AccountType; // e.g., 'customer' or 'shopOwner'
  role?: 'CUSTOMER' | 'SHOP_OWNER';
  token?: string;
  shop?: Shop;
}
// --------------------
// Application Settings
// --------------------
export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'si' | 'ta';
  notifications: boolean;
}
