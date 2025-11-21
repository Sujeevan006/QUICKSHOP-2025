import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { SearchBar } from '@/components/common/SearchBar';
import { ProductCard } from '@/components/cards/ProductCard';
import { mockProducts, mockShops } from '@/utils/mockData';
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
  const themeContext = useTheme();
  const appContext = useApp();

  // 🚨 Safe fallback in case context is null
  const theme = themeContext?.theme ?? {
    text: '#000',
    textSecondary: '#555',
    background: '#fff',
    primary: '#007bff',
    border: '#ccc',
    surface: '#f9f9f9',
  };
  const addToPrebill = appContext?.addToPrebill ?? (() => {});

  const router = useRouter();

  // UI state
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState<PriceFilter>('all');
  const [distance, setDistance] = useState<DistanceFilter>('all');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');

  // ✅ Validate mock data fallback
  const validShops = Array.isArray(mockShops) ? mockShops : [];
  const validProducts = Array.isArray(mockProducts) ? mockProducts : [];

  // Shop distance map
  const shopDistance = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of validShops) {
      const d = (s as any).distance ?? (s as any).distanceKm;
      if (typeof d === 'number') map.set(s.id, d);
    }
    return map;
  }, [validShops]);

  const products = useMemo(() => {
    let list = validProducts.slice();

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (price === 'low') {
      list = list.filter((p) => (p.price || 0) <= 200);
    } else if (price === 'high') {
      list = list.filter((p) => (p.price || 0) > 200);
    }

    if (distance !== 'all') {
      list = list.filter((p) => {
        const d = shopDistance.get(p.shopId) ?? Infinity;
        return distance === 'near' ? d <= 1 : d > 1;
      });
    }

    if (availability !== 'all') {
      if (availability === 'in_stock') {
        list = list.filter((p) => p.availability !== 'out_of_stock');
      } else {
        list = list.filter((p) => p.availability === 'out_of_stock');
      }
    }

    return list;
  }, [query, price, distance, availability, shopDistance]);

  const clearAllFilters = () => {
    setPrice('all');
    setDistance('all');
    setAvailability('all');
  };

  // 👉 Safe toast + addToPrebill
  const handleAdd = (p: Product) => {
    addToPrebill(p, 1);

    Toast.show({
      type: 'success',
      text1: 'Added to cart!',
      visibilityTime: 1000,
      autoHide: true,
      position: 'bottom',
    });
  };

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
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search products or categories..."
        showClearIcon={false}
        leftAccessory={<SearchIcon size={18} color={theme.textSecondary} />}
        rightAccessory={
          <TouchableOpacity
            onPress={() => setShowFilters((v) => !v)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <FilterIcon size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        }
      />

      {/* Filters */}
      {showFilters && (
        <View
          style={{
            padding: 16,
            backgroundColor: theme.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
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
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price Filter */}
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

          {/* Distance Filter */}
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

          {/* Availability Filter */}
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

      {/* Results */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <Text style={{ fontSize: 16, color: theme.textSecondary }}>
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Product Grid */}
      {products.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
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
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
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
