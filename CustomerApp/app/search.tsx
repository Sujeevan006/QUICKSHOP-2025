// app/search.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { SearchBar } from '@/components/common/SearchBar';
import { ProductCard } from '@/components/cards/ProductCard';
import api, { SERVER_URL } from '@/services/api';
import Toast from 'react-native-toast-message';
import {
  Filter as FilterIcon,
  Search as SearchIcon,
  ShoppingCart,
} from 'lucide-react-native';
import type { Product } from '@/types';

type PriceFilter = 'all' | 'low' | 'high';
type DistanceFilter = 'all' | 'near' | 'far';
type AvailabilityFilter = 'all' | 'in_stock' | 'out_of_stock';

export default function SearchScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { addToPrebill } = useApp();

  // UI state
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState<PriceFilter>('all');
  const [distance, setDistance] = useState<DistanceFilter>('all');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch all products or search if API supports it
        // For now, fetching all and filtering client-side to match previous behavior
        // In a real app, you might pass query params: api.get('/products', { params: { search: query } })
        const res = await api.get('/products');
        let list: Product[] = Array.isArray(res.data) ? res.data : [];

        // Map backend fields to frontend Product type if necessary
        // (Assuming backend returns data matching Product interface or close to it)
        list = list.map((p: any) => ({
          ...p,
          id: String(p.id),
          shopId: String(p.shop_id || p.shopId),
          shopName:
            p.shop_name || p.shopName || (p.shop ? p.shop.name : undefined),
          // Ensure image URL is absolute
          image: p.product_image
            ? p.product_image.startsWith('http')
              ? p.product_image
              : `${SERVER_URL}${p.product_image.startsWith('/') ? '' : '/'}${
                  p.product_image
                }`
            : p.image,
          price: Number(p.price),
        }));

        // Client-side filtering (retained from original code)
        // search query
        const q = query.trim().toLowerCase();
        if (q) {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.category || '').toLowerCase().includes(q)
          );
        }

        // price
        if (price === 'low') {
          list = list.filter((p) => (p.price || 0) <= 200);
        } else if (price === 'high') {
          list = list.filter((p) => (p.price || 0) > 200);
        }

        // distance
        if (distance !== 'all') {
          list = list.filter((p) => {
            const d = p.distance ?? Infinity;
            return distance === 'near' ? d <= 1 : d > 1;
          });
        }

        // availability
        if (availability !== 'all') {
          if (availability === 'in_stock') {
            list = list.filter((p) => p.availability !== 'out_of_stock');
          } else {
            list = list.filter((p) => p.availability === 'out_of_stock');
          }
        }

        setProducts(list);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load products',
        });
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchProducts, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query, price, availability, distance]);

  const clearAllFilters = () => {
    setPrice('all');
    setDistance('all');
    setAvailability('all');
  };

  // Add to pre-bill + toast
  const handleAdd = (p: Product) => {
    addToPrebill(p, 1);
    Toast.show({
      type: 'message',
      props: {
        iconOnly: true,
        color: theme.primary,
        icon: <ShoppingCart size={20} color={theme.primary} />,
        onPress: () => router.push('/prebill'),
      },
      visibilityTime: 900,
      position: 'bottom',
      bottomOffset: 72,
    });
  };

  // Small UI helpers
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Text
      style={{
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: active ? theme.primary : theme.border,
        backgroundColor: active ? `${theme.primary}20` : theme.surface,
        marginRight: 8,
        marginBottom: 8,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={{
          color: active ? theme.primary : theme.text,
          fontWeight: '600',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Search bar */}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search products or categories..."
        showClearIcon={false}
        leftAccessory={<SearchIcon size={18} color={theme.textSecondary} />}
        rightAccessory={
          <TouchableOpacity
            onPress={() => setShowFilters((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Toggle filters"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <FilterIcon size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        }
      />

      {/* Filters panel */}
      {showFilters && (
        <View
          style={{
            padding: 16,
            backgroundColor: theme.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          {/* Header row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: '700', color: theme.text }}
            >
              Filters
            </Text>
            <TouchableOpacity
              onPress={clearAllFilters}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: theme.primary,
                borderRadius: 8,
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={{ marginBottom: 12 }}>
            <SectionLabel>Price</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Chip
                label="All"
                active={price === 'all'}
                onPress={() => setPrice('all')}
              />
              <Chip
                label="Under Rs. 200"
                active={price === 'low'}
                onPress={() => setPrice('low')}
              />
              <Chip
                label="Over Rs. 200"
                active={price === 'high'}
                onPress={() => setPrice('high')}
              />
            </View>
          </View>

          {/* Distance */}
          <View style={{ marginBottom: 12 }}>
            <SectionLabel>Distance</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Chip
                label="All"
                active={distance === 'all'}
                onPress={() => setDistance('all')}
              />
              <Chip
                label="Within 1 km"
                active={distance === 'near'}
                onPress={() => setDistance('near')}
              />
              <Chip
                label="Over 1 km"
                active={distance === 'far'}
                onPress={() => setDistance('far')}
              />
            </View>
          </View>

          {/* Availability */}
          <View>
            <SectionLabel>Availability</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Chip
                label="All"
                active={availability === 'all'}
                onPress={() => setAvailability('all')}
              />
              <Chip
                label="In stock"
                active={availability === 'in_stock'}
                onPress={() => setAvailability('in_stock')}
              />
              <Chip
                label="Out of stock"
                active={availability === 'out_of_stock'}
                onPress={() => setAvailability('out_of_stock')}
              />
            </View>
          </View>
        </View>
      )}

      {/* Results header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        }}
      >
        <Text style={{ fontSize: 16, color: theme.textSecondary }}>
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Grid */}
      {products.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <SearchIcon size={64} color={theme.textSecondary} />
          <Text
            style={{
              fontSize: 16,
              color: theme.textSecondary,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            No products found.{'\n'}Try adjusting your search or filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{
            paddingHorizontal: 4,
            paddingBottom: 16,
            paddingTop: 8,
          }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => handleAdd(item)}
              showShopName
            />
          )}
        />
      )}
    </View>
  );
}
