import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet, // 👈 Import StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ShopCard } from '@/components/cards/ShopCard';
import { ProductCard } from '@/components/cards/ProductCard';
import { SearchBar } from '@/components/common/SearchBar';
import { ProductDetailModal } from '@/components/modals/ProductDetailModal';
import type { Product, Shop } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

const FAVORITE_SHOPS_KEY = 'favoriteShopIds';

interface Category {
  id: number;
  name: string;
}
interface Offer {
  id: number;
  title: string;
  description: string;
  banner_image_url: string;
}

export default function ShopDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const shopId = Array.isArray(id) ? id?.[0] : id;

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shops/${shopId}`);
      const { shop, products, categories, offers } = res.data;

      setShop(shop);
      setProducts(products);
      setCategories(categories);
      setOffers(offers);
      setError(null);
    } catch (err: any) {
      console.error('Fetch shop error:', err.message);
      setError('Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) fetchShop();
  }, [shopId]);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FAVORITE_SHOPS_KEY);
        setFavoriteIds(raw ? JSON.parse(raw) : []);
      } catch (e) {
        console.warn('Failed to load favorite shops:', e);
      }
    })();
  }, []);

  // 👇 FIX: isFavorite is now correctly calculated and only when shop exists
  const isFavorite = useMemo(() => {
    return !!(shop && favoriteIds.includes(String(shop.id)));
  }, [shop, favoriteIds]);

  const toggleFavoriteShop = async (sid: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(sid)
        ? prev.filter((x) => x !== sid)
        : [...prev, sid];
      AsyncStorage.setItem(FAVORITE_SHOPS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const openProduct = (p: Product) => {
    setSelectedProduct(p);
    setShowProductModal(true);
  };

  const [activeTab, setActiveTab] = useState<
    'products' | 'categories' | 'offers'
  >('products');

  const [searchProducts, setSearchProducts] = useState('');
  const [searchCategories, setSearchCategories] = useState('');
  const [searchOffers, setSearchOffers] = useState('');
  const [category, setCategory] = useState('all');

  const productSectionTitle = category === 'all' ? 'Products' : category;

  const uniqueCategories = useMemo(() => {
    return categories.map((c) => c.name);
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchesSearch = (p.name || '')
        .toLowerCase()
        .includes(searchProducts.toLowerCase());
      const matchesCategory = category === 'all' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchProducts, category]);

  const filteredOffers = useMemo(
    () =>
      offers.filter(
        (o) =>
          o.title.toLowerCase().includes(searchOffers.toLowerCase()) ||
          (o.description || '')
            .toLowerCase()
            .includes(searchOffers.toLowerCase())
      ),
    [offers, searchOffers]
  );

  const categoryImages: Record<string, string> = {
    /* ... (this remains the same) */
  };
  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setActiveTab('products');
    setSearchProducts('');
  };

  // 👇 FIX: Define the missing styles object
  const styles = StyleSheet.create({
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
    },
    // Add other reusable styles here if needed
  });

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: 10 }}>
          Loading shop…
        </Text>
      </View>
    );
  }

  if (error || !shop) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.text, fontSize: 18 }}>
          {error || 'Shop not found.'}
        </Text>
      </View>
    );
  }

  // 👇 FIX: The entire view is now conditional on `shop` existing.
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ShopCard
        shop={shop} // This is now guaranteed to be a Shop object, not null
        onPress={() => {}}
        showFavoriteIcon
        isFavorite={isFavorite} // This is now correctly passed
        onToggleFavorite={() => toggleFavoriteShop(String(shop.id))}
      />

      {shop.latitude && shop.longitude && (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/map',
              params: {
                id: String(shop.id),
                lat: String(shop.latitude),
                lng: String(shop.longitude),
              },
            })
          }
          style={{
            backgroundColor: theme.primary,
            marginHorizontal: 16,
            marginTop: 12,
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            View on Map
          </Text>
        </TouchableOpacity>
      )}

      {/* Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {(['products', 'categories', 'offers'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === tab ? theme.primary : 'transparent',
            }}
          >
            <Text
              style={{
                color: activeTab === tab ? theme.primary : theme.textSecondary,
                fontWeight: '600',
                fontSize: 16,
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <>
          <SearchBar
            value={searchProducts}
            onChangeText={setSearchProducts}
            placeholder={`Search ${
              category === 'all' ? 'products' : category
            }...`}
          />
          <Text style={styles.sectionTitle}>{productSectionTitle}</Text>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 16 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => openProduct(item)} />
            )}
            ListEmptyComponent={
              <Text
                style={{
                  color: theme.textSecondary,
                  margin: 16,
                  textAlign: 'center',
                }}
              >
                No products found.
              </Text>
            }
          />
        </>
      )}

      <ProductDetailModal
        visible={showProductModal}
        product={selectedProduct}
        onClose={() => setShowProductModal(false)}
      />

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <ScrollView style={{ flex: 1 }}>
          <SearchBar
            value={searchCategories}
            onChangeText={setSearchCategories}
            placeholder="Search categories..."
          />
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            {uniqueCategories.filter((cat) =>
              cat?.toLowerCase().includes(searchCategories.toLowerCase())
            ).length === 0 ? (
              <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                No categories found for this shop.
              </Text>
            ) : (
              uniqueCategories
                .filter((cat) =>
                  cat?.toLowerCase().includes(searchCategories.toLowerCase())
                )
                .map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.surface,
                        borderRadius: 12,
                        marginBottom: 14,
                        borderWidth: 1,
                        borderColor: theme.border,
                        padding: 12,
                      }}
                    >
                      <Image
                        source={{
                          uri: categoryImages[cat] || categoryImages['Other'],
                        }}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          marginRight: 14,
                        }}
                        resizeMode="cover"
                      />
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 18,
                          fontWeight: '500',
                        }}
                      >
                        {cat}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
            )}
          </View>
        </ScrollView>
      )}

      {/* OFFERS TAB */}
      {activeTab === 'offers' && (
        <ScrollView style={{ flex: 1 }}>
          <SearchBar
            value={searchOffers}
            onChangeText={setSearchOffers}
            placeholder="Search offers..."
          />
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            {filteredOffers.length === 0 ? (
              <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                No offers found for this shop.
              </Text>
            ) : (
              filteredOffers.map((offer) => (
                <View
                  key={offer.id}
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: theme.primary,
                  }}
                >
                  <Text
                    style={{
                      color: theme.primary,
                      fontWeight: '700',
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {offer.title}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                    {offer.description}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
