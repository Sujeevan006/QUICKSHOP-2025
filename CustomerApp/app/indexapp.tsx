// app/index.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { SearchBar } from '@/components/common/SearchBar';
import { ShopCard } from '@/components/cards/ShopCard';
import { ProductCard } from '@/components/cards/ProductCard'; // keep if needed elsewhere
import { mockShops } from '@/utils/mockData';
import {
  Store,
  Tag,
  Truck,
  Utensils,
  Wrench,
  Wallet as WalletIcon,
  Search,
  ShoppingCart,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IconType = React.ComponentType<{ size?: number; color?: string }>;
const FAVORITE_SHOPS_KEY = 'favoriteShopIds';

export default function HomeScreen() {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const app = useApp();
  const { user, shoppingList } = app;
  const router = useRouter();

  const [search, setSearch] = useState('');

  // Banner slider
  const banners = useMemo(
    () => [
      {
        id: 'b1',
        uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=60',
      },
      {
        id: 'b2',
        uri: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=60',
      },
      {
        id: 'b3',
        uri: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1200&q=60',
      },
    ],
    []
  );
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerWidth, setBannerWidth] = useState(0);
  const bannerRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!bannerWidth || banners.length <= 1) return;
    const id = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % banners.length;
        bannerRef.current?.scrollTo({ x: next * bannerWidth, animated: true });
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [bannerWidth, banners.length]);

  const onBannerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    if (bannerWidth > 0) {
      const i = Math.round(x / bannerWidth);
      setBannerIndex(i);
    }
  };

  const prebillSummary = useMemo(() => {
    const shopIds = new Set(shoppingList.map((i) => i.product.shopId));
    const itemsCount = shoppingList.reduce((a, b) => a + b.quantity, 0);
    return { shops: shopIds.size, items: itemsCount };
  }, [shoppingList]);

  // Quick actions (buttons)
  const actions = useMemo(
    () => [
      {
        key: 'shops',
        title: 'Shops',
        icon: Store as IconType,
        accent: '#0ea5e9',
        onPress: () => router.push('/shops'),
      },
      {
        key: 'offers',
        title: 'Offers',
        icon: Tag as IconType,
        accent: '#8b5cf6',
        onPress: () => router.push('/shops'),
      },
      {
        key: 'delivery',
        title: 'Delivery',
        icon: Truck as IconType,
        accent: '#f59e0b',
        onPress: () => router.push('/map'),
      },
      {
        key: 'foods',
        title: 'Foods',
        icon: Utensils as IconType,
        accent: '#ef4444',
        onPress: () => router.push('/shops'),
      },
      {
        key: 'services',
        title: 'Services',
        icon: Wrench as IconType,
        accent: '#10b981',
        onPress: () => router.push('/shops'),
      },
      {
        key: 'wallet',
        title: 'Wallet',
        icon: WalletIcon as IconType,
        accent: '#f97316',
        onPress: () => router.push('/settings'),
      },
    ],
    [router]
  );

  // Favorite shops from AsyncStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

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

  const favoriteShops: typeof mockShops = useMemo(() => {
    if (!favoriteIds?.length) return [];
    const setIds = new Set(favoriteIds);
    return mockShops.filter((s) => s && s.id && setIds.has(s.id));
  }, [favoriteIds]);

  // UI helpers
  const SectionHeader = ({
    title,
    onPress,
  }: {
    title: string;
    onPress?: () => void;
  }) => (
    <View
      style={{
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>
        {title}
      </Text>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
        >
          <Text style={{ color: theme.primary, fontWeight: '800' }}>
            See all
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 64 }} />
      )}
    </View>
  );

  const ActionButton = ({
    title,
    icon,
    accent,
    onPress,
    containerStyle,
  }: {
    title: string;
    icon: IconType;
    accent: string;
    onPress: () => void;
    containerStyle?: ViewStyle;
  }) => {
    const IconComp = icon;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            justifyContent: 'center',
            width: '100%', // fill grid cell
          },
          containerStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <IconComp size={18} color={accent} />
        <Text
          numberOfLines={1}
          style={{
            marginLeft: 8,
            color: theme.text,
            fontWeight: '700',
            fontSize: 13.5,
          }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const goToShopsWithQuery = () => {
    router.push({ pathname: '/shops', params: { q: search } });
  };

  const GRID_GAP = 12;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Greeting */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          Welcome{user?.name ? `, ${user.name}` : ''}
        </Text>
        <Text
          style={{
            color: theme.text,
            fontSize: 22,
            fontWeight: '800',
            marginTop: 4,
          }}
        >
          Find the best nearby
        </Text>
      </View>

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search shops or products..."
        showClearIcon={false}
        rightAccessory={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  marginRight: 8,
                }}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={goToShopsWithQuery}
              style={{
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
              accessibilityRole="button"
              accessibilityLabel="Search"
            >
              <Search size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Banner slider */}
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        <View
          onLayout={(e) => setBannerWidth(e.nativeEvent.layout.width)}
          style={{
            borderRadius: 14,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScrollEnd}
          >
            {banners.map((b) => (
              <Image
                key={b.id}
                source={{ uri: b.uri }}
                style={{
                  width: bannerWidth || 0,
                  height: 150,
                }}
              />
            ))}
          </ScrollView>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          {banners.map((_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                marginHorizontal: 3,
                backgroundColor:
                  i === bannerIndex ? theme.primary : theme.border,
              }}
            />
          ))}
        </View>
      </View>

      {/* Quick actions as 3-column grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: 16,
          marginTop: 8,
          marginHorizontal: -GRID_GAP / 2,
        }}
      >
        {actions.map((a) => (
          <View
            key={a.key}
            style={{
              width: '33.3333%',
              paddingHorizontal: GRID_GAP / 2,
              paddingVertical: GRID_GAP / 2,
            }}
          >
            <ActionButton
              title={a.title}
              icon={a.icon}
              accent={a.accent}
              onPress={a.onPress}
            />
          </View>
        ))}
      </View>

      {/* Favorite shops (from AsyncStorage) */}
      <SectionHeader
        title="Favorite shops"
        onPress={() => router.push('/favorites')}
      />
      {favoriteShops.length > 0 ? (
        <FlatList
          horizontal
          data={favoriteShops}
          keyExtractor={(item: any) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item }: any) => (
            <View style={{ width: 260 }}>
              <ShopCard
                shop={item}
                onPress={() =>
                  router.push({
                    pathname: '/shops/[id]',
                    params: { id: item.id },
                  })
                }
                containerStyle={{ marginHorizontal: 4 }}
              />
            </View>
          )}
        />
      ) : (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>
            No favorite shops yet
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/shops')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: theme.primary,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>
              Browse shops
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pre-Bill summary CTA */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.surface,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: `${theme.primary}1A`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <ShoppingCart size={18} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>Pre-Bill</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {prebillSummary.shops} shops, {prebillSummary.items} items
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/prebill')}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: theme.primary,
          }}
          accessibilityRole="button"
          accessibilityLabel="Open pre-bill"
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>Open</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
