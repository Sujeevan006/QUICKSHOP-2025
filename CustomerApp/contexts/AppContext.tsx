import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Shop,
  Product,
  ShoppingListItem,
  UserProfile,
  AppSettings,
  PackingStatus,
  PackingStatusMap,
} from '@/types';

type AppContextType = {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Favorites
  favoriteShops: Shop[];
  favoriteProducts: Product[];
  addToFavoriteShops: (shop: Shop) => void;
  removeFromFavoriteShops: (shopId: string) => void;
  addToFavoriteProducts: (product: Product) => void;
  removeFromFavoriteProducts: (productId: string) => void;

  // Helpful favorites utilities
  isShopFavorite: (shopId: string) => boolean;
  toggleFavoriteShop: (shop: Shop) => void;
  isProductFavorite: (productId: string) => boolean;
  toggleFavoriteProduct: (product: Product) => void;

  // Wishlist aliases (maps to favoriteProducts)
  wishlistProducts: Product[];
  isProductWishlisted: (productId: string) => boolean;
  toggleWishlistProduct: (product: Product) => void;

  // Shopping list (Pre-Bill)
  shoppingList: ShoppingListItem[];
  addToShoppingList: (product: Product, quantity: number) => void;
  updateShoppingListQuantity: (productId: string, quantity: number) => void;
  removeFromShoppingList: (productId: string) => void;
  clearShoppingList: () => void;

  // Pre-bill aliases
  prebillItems: ShoppingListItem[];
  addToPrebill: (product: Product, quantity: number) => void;
  updatePrebillQty: (productId: string, quantity: number) => void;
  removeFromPrebill: (productId: string) => void;
  clearPrebill: () => void;
  prebillTotal: number;

  // Packing requests per shop
  packingStatus: PackingStatusMap;
  getPackingStatus: (shopId: string) => PackingStatus | undefined;
  requestPacking: (shopId: string) => void;
  cancelPackingRequest: (shopId: string) => void;
  updatePackingStatus: (shopId: string, status: PackingStatus) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};

interface AppProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  user: 'user',
  favoriteShops: 'favoriteShops',
  favoriteProducts: 'favoriteProducts',
  shoppingList: 'shoppingList',
  settings: 'settings',
  packingStatus: 'packingStatus', // NEW
} as const;

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favoriteShops, setFavoriteShops] = useState<Shop[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'en',
    notifications: true,
  });
  const [packingStatus, setPackingStatus] = useState<PackingStatusMap>({}); // NEW

  // Load data from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        // Check if we've cleaned up old mock data
        const cleanupDone = await AsyncStorage.getItem('mock_data_cleanup_v1');

        if (!cleanupDone) {
          // Clear stale data
          await AsyncStorage.removeItem(STORAGE_KEYS.shoppingList);
          await AsyncStorage.removeItem(STORAGE_KEYS.favoriteShops);
          await AsyncStorage.setItem('mock_data_cleanup_v1', 'true');
          console.log('Cleaned up stale mock data');

          // Load only user and settings
          const [storedUser, storedSettings] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.user),
            AsyncStorage.getItem(STORAGE_KEYS.settings),
          ]);

          if (storedUser) setUser(JSON.parse(storedUser));
          if (storedSettings) setSettings(JSON.parse(storedSettings));
        } else {
          // Normal load
          const [
            storedUser,
            storedFavoriteShops,
            storedFavoriteProducts,
            storedShoppingList,
            storedSettings,
            storedPackingStatus,
          ] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.user),
            AsyncStorage.getItem(STORAGE_KEYS.favoriteShops),
            AsyncStorage.getItem(STORAGE_KEYS.favoriteProducts),
            AsyncStorage.getItem(STORAGE_KEYS.shoppingList),
            AsyncStorage.getItem(STORAGE_KEYS.settings),
            AsyncStorage.getItem(STORAGE_KEYS.packingStatus),
          ]);

          if (storedUser) setUser(JSON.parse(storedUser));
          if (storedFavoriteShops)
            setFavoriteShops(JSON.parse(storedFavoriteShops));
          if (storedFavoriteProducts)
            setFavoriteProducts(JSON.parse(storedFavoriteProducts));
          if (storedShoppingList)
            setShoppingList(JSON.parse(storedShoppingList));
          if (storedSettings) setSettings(JSON.parse(storedSettings));
          if (storedPackingStatus)
            setPackingStatus(JSON.parse(storedPackingStatus));
        }
      } catch (error) {
        console.error('Error loading app data:', error);
      }
    })();
  }, []);

  const saveToStorage = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // Favorite shops
  const isShopFavorite = (shopId: string) =>
    favoriteShops.some((s) => s.id === shopId);

  const addToFavoriteShops = (shop: Shop) => {
    setFavoriteShops((prev) => {
      if (prev.some((s) => s.id === shop.id)) return prev;
      const updated = [...prev, shop];
      saveToStorage(STORAGE_KEYS.favoriteShops, updated);
      return updated;
    });
  };

  const removeFromFavoriteShops = (shopId: string) => {
    setFavoriteShops((prev) => {
      const updated = prev.filter((s) => s.id !== shopId);
      saveToStorage(STORAGE_KEYS.favoriteShops, updated);
      return updated;
    });
  };

  const toggleFavoriteShop = (shop: Shop) => {
    setFavoriteShops((prev) => {
      const exists = prev.some((s) => s.id === shop.id);
      const updated = exists
        ? prev.filter((s) => s.id !== shop.id)
        : [...prev, shop];
      saveToStorage(STORAGE_KEYS.favoriteShops, updated);
      return updated;
    });
  };

  // Favorite products (wishlist)
  const isProductFavorite = (productId: string) =>
    favoriteProducts.some((p) => p.id === productId);

  const addToFavoriteProducts = (product: Product) => {
    setFavoriteProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      const updated = [...prev, product];
      saveToStorage(STORAGE_KEYS.favoriteProducts, updated);
      return updated;
    });
  };

  const removeFromFavoriteProducts = (productId: string) => {
    setFavoriteProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      saveToStorage(STORAGE_KEYS.favoriteProducts, updated);
      return updated;
    });
  };

  const toggleFavoriteProduct = (product: Product) => {
    setFavoriteProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const updated = exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
      saveToStorage(STORAGE_KEYS.favoriteProducts, updated);
      return updated;
    });
  };

  // Wishlist aliases
  const wishlistProducts = favoriteProducts;
  const isProductWishlisted = isProductFavorite;
  const toggleWishlistProduct = toggleFavoriteProduct;

  // Shopping list (Pre-Bill)
  const addToShoppingList = (product: Product, quantity: number) => {
    if (!quantity || quantity <= 0) return;

    setShoppingList((prev) => {
      const idx = prev.findIndex(
        (i) => String(i.product.id) === String(product.id)
      );
      let updated: ShoppingListItem[];

      const price = Number(product.price) || 0;

      if (idx >= 0) {
        const nextQty = prev[idx].quantity + quantity;
        updated = prev.map((i, n) =>
          n === idx ? { ...i, quantity: nextQty, subtotal: nextQty * price } : i
        );
      } else {
        updated = [...prev, { product, quantity, subtotal: quantity * price }];
      }

      saveToStorage(STORAGE_KEYS.shoppingList, updated);
      return updated;
    });
  };

  const updateShoppingListQuantity = (productId: string, quantity: number) => {
    setShoppingList((prev) => {
      const targetItem = prev.find(
        (i) => String(i.product.id) === String(productId)
      );
      const price = Number(targetItem?.product.price) || 0;

      const updated = prev
        .map((i) =>
          String(i.product.id) === String(productId)
            ? { ...i, quantity, subtotal: Math.max(0, quantity) * price }
            : i
        )
        .filter((i) => i.quantity > 0);

      saveToStorage(STORAGE_KEYS.shoppingList, updated);
      return updated;
    });
  };

  const removeFromShoppingList = (productId: string) => {
    setShoppingList((prev) => {
      const updated = prev.filter(
        (i) => String(i.product.id) !== String(productId)
      );
      saveToStorage(STORAGE_KEYS.shoppingList, updated);
      return updated;
    });
  };

  const clearShoppingList = () => {
    setShoppingList([]);
    saveToStorage(STORAGE_KEYS.shoppingList, []);
  };

  // Pre-bill aliases
  const prebillItems = shoppingList;
  const addToPrebill = addToShoppingList;
  const updatePrebillQty = updateShoppingListQuantity;
  const removeFromPrebill = removeFromShoppingList;
  const clearPrebill = clearShoppingList;

  const prebillTotal = useMemo(
    () => shoppingList.reduce((sum, i) => sum + (i.subtotal || 0), 0),
    [shoppingList]
  );

  // Packing requests per shop
  const getPackingStatus = (shopId: string): PackingStatus | undefined =>
    packingStatus[shopId];

  const requestPacking = (shopId: string) => {
    setPackingStatus((prev) => {
      const updated = { ...prev, [shopId]: 'pending' as PackingStatus };
      saveToStorage(STORAGE_KEYS.packingStatus, updated);
      return updated;
    });
  };

  const cancelPackingRequest = (shopId: string) => {
    setPackingStatus((prev) => {
      const updated = { ...prev };
      delete updated[shopId];
      saveToStorage(STORAGE_KEYS.packingStatus, updated);
      return updated;
    });
  };

  const updatePackingStatus = (shopId: string, status: PackingStatus) => {
    setPackingStatus((prev) => {
      const updated = { ...prev, [shopId]: status };
      saveToStorage(STORAGE_KEYS.packingStatus, updated);
      return updated;
    });
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveToStorage(STORAGE_KEYS.settings, updated);
  };

  const value: AppContextType = {
    // user
    user,
    setUser,

    // favorites
    favoriteShops,
    favoriteProducts,
    addToFavoriteShops,
    removeFromFavoriteShops,
    addToFavoriteProducts,
    removeFromFavoriteProducts,

    // helpers
    isShopFavorite,
    toggleFavoriteShop,
    isProductFavorite,
    toggleFavoriteProduct,

    // wishlist aliases
    wishlistProducts,
    isProductWishlisted,
    toggleWishlistProduct,

    // shopping list / pre-bill
    shoppingList,
    addToShoppingList,
    updateShoppingListQuantity,
    removeFromShoppingList,
    clearShoppingList,

    prebillItems,
    addToPrebill,
    updatePrebillQty,
    removeFromPrebill,
    clearPrebill,
    prebillTotal,

    // packing
    packingStatus,
    getPackingStatus,
    requestPacking,
    cancelPackingRequest,
    updatePackingStatus,

    // settings
    settings,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
