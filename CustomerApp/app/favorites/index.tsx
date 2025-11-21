// app/favorites/index.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { ShopCard } from '@/components/cards/ShopCard';
import { ProductCard } from '@/components/cards/ProductCard';
import { SearchBar } from '@/components/common/SearchBar';
import { ProductDetailModal } from '@/components/modals/ProductDetailModal';
import type { Product, Shop } from '@/types';
import { mockShops } from '@/utils/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Heart, ShoppingBag, Store } from 'lucide-react-native';

const FAVORITE_SHOPS_KEY = 'favoriteShopIds';

const safeLower = (v: any) => (typeof v === 'string' ? v.toLowerCase() : '');

export default function FavoritesScreen() {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const router = useRouter();
  const { favoriteProducts: ctxFavoriteProducts } = useApp();

  const [activeTab, setActiveTab] = useState<'shops' | 'products'>('shops');

  // Shops favorites (AsyncStorage)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [shopQuery, setShopQuery] = useState('');

  // Products favorites (from AppContext, guarded)
  const [productQuery, setProductQuery] = useState('');
  
  // Filter out null/undefined products to prevent crashes
  const favoriteProducts = useMemo(() => {
    if (!Array.isArray(ctxFavoriteProducts)) return [];
    return ctxFavoriteProducts.filter((p) => p && p.id);
  }, [ctxFavoriteProducts]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const loadFavoriteIds = async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITE_SHOPS_KEY);
      const ids = raw ? (JSON.parse(raw) as any) : [];
      setFavoriteIds(Array.isArray(ids) ? ids.filter(Boolean) : []);
    } catch (e) {
      console.warn('Failed to load favorite shops:', e);
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    loadFavoriteIds();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavoriteIds();
      return () => {};
    }, [])
  );

  // Build favorite shops list from IDs and mock catalog; filter(Boolean) removes any unmatched
  const favoriteShopsList: Shop[] = useMemo(() => {
    if (!favoriteIds?.length) return [];
    const setIds = new Set(favoriteIds);
    return mockShops.filter((s) => s && s.id && setIds.has(s.id));
  }, [favoriteIds]);

  const filteredShops = useMemo(() => {
    const q = safeLower(shopQuery.trim());
    if (!q) return favoriteShopsList;
    return favoriteShopsList.filter((s) =>
      safeLower((s as any)?.name).includes(q)
    );
  }, [favoriteShopsList, shopQuery]);

  const filteredProducts = useMemo(() => {
    const q = safeLower(productQuery.trim());
    if (!q) return favoriteProducts;
    return favoriteProducts.filter((p: any) => safeLower(p?.name).includes(q));
  }, [favoriteProducts, productQuery]);

  const toggleFavoriteShop = async (sid: string) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(sid);
      const next = exists ? prev.filter((x) => x !== sid) : [...prev, sid];
      AsyncStorage.setItem(FAVORITE_SHOPS_KEY, JSON.stringify(next)).catch(
        () => {}
      );
      return next;
    });
  };

  const openProduct = (p: Product) => {
    setSelectedProduct(p);
    setShowProductModal(true);
  };

  // Modern Segmented Control
  const TabButton = ({
    label,
    icon,
    active,
    onPress,
  }: {
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: active ? theme.surface : 'transparent',
        borderRadius: 12,
        margin: 4,
        ...Platform.select({
          ios: active ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          } : {},
          android: active ? { elevation: 2 } : {},
        }),
      }}
    >
      {React.cloneElement(icon as React.ReactElement, {
        size: 16,
        color: active ? theme.primary : theme.textSecondary,
        style: { marginRight: 6 }
      })}
      <Text
        style={{
          color: active ? theme.primary : theme.textSecondary,
          fontWeight: active ? '700' : '600',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header Title */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text }}>
          My Wishlist
        </Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>
          Your saved shops and products
        </Text>
      </View>

      {/* Modern Tabs */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginTop: 12,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
          borderRadius: 16,
          padding: 2,
        }}
      >
        <TabButton
          label="Shops"
          icon={<Store />}
          active={activeTab === 'shops'}
          onPress={() => setActiveTab('shops')}
        />
        <TabButton
          label="Products"
          icon={<ShoppingBag />}
          active={activeTab === 'products'}
          onPress={() => setActiveTab('products')}
        />
      </View>

      {/* Search per tab */}
      <View style={{ paddingHorizontal: 4 }}>
        {activeTab === 'shops' ? (
          <SearchBar
            value={shopQuery}
            onChangeText={setShopQuery}
            placeholder="Search saved shops..."
            showClearIcon={false}
            containerStyle={{ marginHorizontal: 20 }}
          />
        ) : (
          <SearchBar
            value={productQuery}
            onChangeText={setProductQuery}
            placeholder="Search saved products..."
            showClearIcon={false}
            containerStyle={{ marginHorizontal: 20 }}
          />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, marginTop: 8 }}>
        {activeTab === 'shops' ? (
          <FlatList
            data={filteredShops}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ShopCard
                shop={item}
                onPress={() =>
                  router.push({
                    pathname: '/shops/[id]',
                    params: { id: item.id },
                  })
                }
                showFavoriteIcon
                isFavorite={favoriteIds.includes(item.id)}
                onToggleFavorite={() => toggleFavoriteShop(item.id)}
                containerStyle={{ 
                  marginHorizontal: 20, 
                  marginVertical: 6,
                  backgroundColor: theme.surface,
                  borderWidth: isDark ? 1 : 0,
                  ...Platform.select({
                    ios: { shadowOpacity: isDark ? 0 : 0.06 },
                    android: { elevation: isDark ? 0 : 2 }
                  })
                }}
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 40 }}>
                <View style={{ 
                  width: 64, height: 64, borderRadius: 32, 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 16
                }}>
                  <Heart size={28} color={theme.textSecondary} />
                </View>
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  {shopQuery.length > 0 ? 'No shops found' : 'No favorite shops yet'}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 6 }}>
                  {shopQuery.length > 0 
                    ? 'Try adjusting your search terms' 
                    : 'Start exploring and save your favorite shops here!'}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
          />
        ) : (
          <>
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
              contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
              renderItem={({ item }) => (
                <View style={{ width: '48%', marginBottom: 12 }}>
                  <ProductCard
                    product={item}
                    onPress={() => openProduct(item)}
                    showShopName
                    containerStyle={{ width: '100%', margin: 0, maxWidth: '100%' }}
                  />
                </View>
              )}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 40 }}>
                  <View style={{ 
                    width: 64, height: 64, borderRadius: 32, 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 16
                  }}>
                    <ShoppingBag size={28} color={theme.textSecondary} />
                  </View>
                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                    {productQuery.length > 0 ? 'No products found' : 'No favorite products yet'}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 6 }}>
                    {productQuery.length > 0 
                      ? 'Try adjusting your search terms' 
                      : 'Save items you love to find them easily later.'}
                  </Text>
                </View>
              }
            />

            <ProductDetailModal
              visible={showProductModal}
              product={selectedProduct}
              onClose={() => setShowProductModal(false)}
            />
          </>
        )}
      </View>
    </View>
  );
}
