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
  Dimensions,
  Platform,
} from 'react-native';

import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { SearchBar } from '@/components/common/SearchBar';
import { ShopCard } from '@/components/cards/ShopCard';
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
  ChevronRight,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IconType = React.ComponentType<{ size?: number; color?: string }>;
const FAVORITE_SHOPS_KEY = 'favoriteShopIds';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  // Removed auto-scroll logic as per user request for "unwanted animations"

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
        accent: '#0ea5e9', // Sky blue
        onPress: () => router.push('/shops'),
      },
      {
        key: 'offers',
        title: 'Offers',
        icon: Tag as IconType,
        accent: '#8b5cf6', // Violet
        onPress: () => router.push('/shops'),
      },
      {
        key: 'delivery',
        title: 'Delivery',
        icon: Truck as IconType,
        accent: '#f59e0b', // Amber
        onPress: () => router.push('/map'),
      },
      {
        key: 'foods',
        title: 'Foods',
        icon: Utensils as IconType,
        accent: '#ef4444', // Red
        onPress: () => router.push('/shops'),
      },
      {
        key: 'services',
        title: 'Services',
        icon: Wrench as IconType,
        accent: '#10b981', // Emerald
        onPress: () => router.push('/shops'),
      },
      {
        key: 'wallet',
        title: 'Wallet',
        icon: WalletIcon as IconType,
        accent: '#f97316', // Orange
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
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.5 }}>
        {title}
      </Text>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 14, marginRight: 2 }}>
            See all
          </Text>
          <ChevronRight size={16} color={theme.primary} />
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
  }: {
    title: string;
    icon: IconType;
    accent: string;
    onPress: () => void;
  }) => {
    const IconComp = icon;
    // Create a subtle background for the icon based on the accent color
    // For dark mode, we use a slightly more opaque background
    const bgOpacity = isDark ? '20' : '15'; // hex opacity
    const iconBg = `${accent}${bgOpacity}`;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 20, // Squircle-ish
            backgroundColor: iconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <IconComp size={24} color={accent} />
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: theme.text,
            fontWeight: '500',
            fontSize: 13,
            textAlign: 'center',
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header & Greeting */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '500' }}>
          Welcome back{user?.name ? `, ${user.name}` : ''} 👋
        </Text>
        <Text
          style={{
            color: theme.text,
            fontSize: 28,
            fontWeight: '800',
            marginTop: 4,
            letterSpacing: -0.5,
            lineHeight: 36,
          }}
        >
          Find the best{'\n'}shops nearby
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 4 }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search shops, items..."
          showClearIcon={false}
          containerStyle={{ marginHorizontal: 20 }}
          inputStyle={{ fontWeight: '500' }}
          rightAccessory={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  style={{
                    backgroundColor: theme.surface,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: '600', fontSize: 12 }}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={goToShopsWithQuery}
                style={{
                  backgroundColor: theme.primary,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                }}
              >
                <Search size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Banner slider */}
      <View style={{ marginTop: 20 }}>
        <View
          onLayout={(e) => setBannerWidth(e.nativeEvent.layout.width)}
          style={{
            marginHorizontal: 20,
            borderRadius: 20,
            overflow: 'hidden',
            height: 160,
            backgroundColor: theme.surface,
            // Soft shadow for depth
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
              },
              android: {
                elevation: 4,
              },
            }),
          }}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScrollEnd}
            scrollEventThrottle={16}
          >
            {banners.map((b) => (
              <Image
                key={b.id}
                source={{ uri: b.uri }}
                style={{
                  width: bannerWidth || SCREEN_WIDTH - 40,
                  height: 160,
                  resizeMode: 'cover',
                }}
              />
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {banners.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === bannerIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  marginHorizontal: 3,
                  backgroundColor: '#fff',
                  opacity: i === bannerIndex ? 1 : 0.5,
                }}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Quick actions Grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: 12,
          marginTop: 24,
        }}
      >
        {actions.map((a) => (
          <View
            key={a.key}
            style={{
              width: '33.33%',
              padding: 8,
              alignItems: 'center',
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

      {/* Favorite shops */}
      <SectionHeader
        title="Favorite Shops"
        onPress={() => router.push('/favorites')}
      />
      
      {favoriteShops.length > 0 ? (
        <FlatList
          horizontal
          data={favoriteShops}
          keyExtractor={(item: any) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }: any) => (
            <View style={{ width: 280 }}>
              <ShopCard
                shop={item}
                onPress={() =>
                  router.push({
                    pathname: '/shops/[id]',
                    params: { id: item.id },
                  })
                }
                // Override styles for a cleaner look
                containerStyle={{
                  marginHorizontal: 0,
                  marginVertical: 4,
                  borderWidth: 0,
                  backgroundColor: theme.surface,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 3,
                    },
                  }),
                }}
              />
            </View>
          )}
        />
      ) : (
        <View
          style={{
            marginHorizontal: 20,
            borderRadius: 16,
            backgroundColor: theme.surface,
            padding: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
            borderStyle: 'dashed',
          }}
        >
          <Text style={{ color: theme.textSecondary, marginBottom: 12, textAlign: 'center' }}>
            You haven't added any favorite shops yet.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/shops')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: theme.primary,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>
              Explore Shops
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pre-Bill Summary Widget */}
      {prebillSummary.items > 0 && (
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => router.push('/prebill')}
            activeOpacity={0.9}
            style={{
              borderRadius: 16,
              backgroundColor: theme.surface,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border,
              ...Platform.select({
                ios: {
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                },
                android: {
                  elevation: 4,
                },
              }),
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: `${theme.primary}15`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <ShoppingCart size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>
                Current Pre-Bill
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
                {prebillSummary.items} items from {prebillSummary.shops} shops
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.primary,
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
