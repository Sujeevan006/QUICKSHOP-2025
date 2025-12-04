// app/favorites/index.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { ShopCard } from '@/components/cards/ShopCard';
import { ProductCard } from '@/components/cards/ProductCard';
import { SearchBar } from '@/components/common/SearchBar';
import { ProductDetailModal } from '@/components/modals/ProductDetailModal';
import type { Product, Shop } from '@/types';
import api, { SERVER_URL } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITE_SHOPS_KEY = 'favoriteShopIds';

const safeLower = (v: any) => (typeof v === 'string' ? v.toLowerCase() : '');

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { favoriteProducts: ctxFavoriteProducts } = useApp();

  const [activeTab, setActiveTab] = useState<'shops' | 'products'>('shops');

  // Shops favorites (AsyncStorage)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [shopQuery, setShopQuery] = useState('');

  // Products favorites (from AppContext, guarded)
  const [productQuery, setProductQuery] = useState('');
  const favoriteProducts = Array.isArray(ctxFavoriteProducts)
    ? ctxFavoriteProducts
    : [];

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
  const [favoriteShopsList, setFavoriteShopsList] = useState<Shop[]>([]);

  useEffect(() => {
    const fetchFavoriteShops = async () => {
      if (!favoriteIds?.length) {
        setFavoriteShopsList([]);
        return;
      }

      try {
        const res = await api.get('/shops');
        const allShops = Array.isArray(res.data) ? res.data : [];

        const favs = allShops
          .filter((s: any) => favoriteIds.includes(String(s.id)))
          .map((s: any) => ({
            ...s,
            id: String(s.id),
            name: s.shop_name || s.name,
            address: s.shop_address || s.address,
            category: s.shop_category || s.category,
            image: s.image
              ? s.image.startsWith('http')
                ? s.image
                : `${SERVER_URL}${s.image.startsWith('/') ? '' : '/'}${s.image}`
              : null,
            isOpen: s.is_open,
            rating: s.rating,
          }));

        setFavoriteShopsList(favs);
      } catch (error) {
        console.error('Failed to fetch favorite shops:', error);
      }
    };

    fetchFavoriteShops();
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

  // Segmented control
  const SegButton = ({
    label,
    active,
    onPress,
    leftRounded,
    rightRounded,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
    leftRounded?: boolean;
    rightRounded?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: active ? theme.primary : theme.border,
        backgroundColor: active ? `${theme.primary}20` : theme.surface,
        ...(leftRounded
          ? { borderTopLeftRadius: 999, borderBottomLeftRadius: 999 }
          : {}),
        ...(rightRounded
          ? { borderTopRightRadius: 999, borderBottomRightRadius: 999 }
          : {}),
      }}
    >
      <Text
        style={{
          color: active ? theme.primary : theme.textSecondary,
          fontWeight: '700',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Segmented options */}
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          marginTop: 12,
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <SegButton
          label="Favorite shops"
          active={activeTab === 'shops'}
          onPress={() => setActiveTab('shops')}
          leftRounded
        />
        <SegButton
          label="Favorite products"
          active={activeTab === 'products'}
          onPress={() => setActiveTab('products')}
          rightRounded
        />
      </View>

      {/* Search per tab */}
      {activeTab === 'shops' ? (
        <SearchBar
          value={shopQuery}
          onChangeText={setShopQuery}
          placeholder="Search favorite shops..."
          showClearIcon={false}
          rightAccessory={
            shopQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setShopQuery('')}
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  marginRight: 6,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Clear</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      ) : (
        <SearchBar
          value={productQuery}
          onChangeText={setProductQuery}
          placeholder="Search favorite products..."
          showClearIcon={false}
          rightAccessory={
            productQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setProductQuery('')}
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  marginRight: 6,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Clear</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      {/* Content */}
      {activeTab === 'shops' ? (
        <FlatList
          data={filteredShops}
          keyExtractor={(item) => String(item.id)}
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
              isFavorite={favoriteIds.includes(String(item.id))}
              onToggleFavorite={() => toggleFavoriteShop(String(item.id))}
            />
          )}
          ListEmptyComponent={
            <Text
              style={{
                color: theme.textSecondary,
                marginHorizontal: 16,
                marginTop: 16,
              }}
            >
              {shopQuery.length > 0
                ? 'No favorite shops match your search.'
                : 'No favorite shops yet.'}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      ) : (
        <>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 16 }}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => openProduct(item)}
                showShopName
              />
            )}
            ListEmptyComponent={
              <Text
                style={{
                  color: theme.textSecondary,
                  marginHorizontal: 16,
                  marginTop: 16,
                }}
              >
                {productQuery.length > 0
                  ? 'No favorite products match your search.'
                  : 'No favorite products yet.'}
              </Text>
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
  );
}
