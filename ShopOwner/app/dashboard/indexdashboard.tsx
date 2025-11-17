import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Layers,
  PackageSearch,
  Settings as SettingsIcon,
  ShoppingBag,
  Tag, // 👈 1. IMPORT THE NEW ICON
} from 'lucide-react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Offer {
  id: number;
  title: string;
  banner_image_url: string;
}

export default function DashboardScreen() {
  const { user, token } = useContext(AuthContext);
  const { theme } = useTheme() as any;
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [sliderData, setSliderData] = useState<Offer[]>([]);
  const [activeIndex, setActiveIndex] = useState(1);
  const flatListRef = useRef<FlatList<Offer>>(null);

  const shop = user?.shop;

  const loadOffers = async () => {
    if (!token) return;
    try {
      setLoadingOffers(true);
      const res = await api.get('/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data);
    } catch (e) {
      console.error('Failed to load offers:', e);
      setOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOffers();
    }, [token])
  );

  useEffect(() => {
    if (offers.length > 1) {
      const dataForLoop = [offers[offers.length - 1], ...offers, offers[0]];
      setSliderData(dataForLoop);
      setActiveIndex(1);
    } else {
      setSliderData(offers);
    }
  }, [offers]);

  useEffect(() => {
    if (sliderData.length > 1 && flatListRef.current) {
      const timer = setInterval(() => {
        flatListRef.current?.scrollToIndex({
          index: activeIndex < sliderData.length - 1 ? activeIndex + 1 : 1,
          animated: true,
        });
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [activeIndex, sliderData.length]);

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (sliderData.length <= 1) return;

    const itemWidth = width - 32;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    let newIndex = Math.round(contentOffsetX / itemWidth);

    if (newIndex === 0) {
      // Scrolled to the first item (clone of the last)
      newIndex = sliderData.length - 2;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
    } else if (newIndex === sliderData.length - 1) {
      // Scrolled to the last item (clone of the first)
      newIndex = 1;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
    }
    setActiveIndex(newIndex);
  };

  const handleOfferPress = () => {
    // This can navigate to the dedicated offers screen as well
    router.push({ pathname: '/offers' });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={styles.header}>
        <Text style={[styles.greetingText, { color: theme.textSecondary }]}>
          Welcome, {user?.name || 'Shop Owner'} 👋
        </Text>
        <Text style={[styles.shopName, { color: theme.text }]}>
          {shop?.shop_name || 'Your Shop'}
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Your Active Offers
        </Text>
        {loadingOffers ? (
          <ActivityIndicator style={{ marginTop: 20 }} color={theme.primary} />
        ) : sliderData.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={sliderData}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={1}
              onScrollToIndexFailed={() => {}}
              getItemLayout={(_, index) => ({
                length: width - 32,
                offset: (width - 32) * index,
                index,
              })}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleOfferPress}
                  style={styles.slideWrapper}
                >
                  <View style={styles.slide}>
                    <Image
                      source={{ uri: item.banner_image_url }}
                      style={styles.bannerImage}
                    />
                    <View style={styles.overlay} />
                    <Text style={styles.slideTitle}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              )}
              decelerationRate="fast"
              snapToInterval={width - 32}
            />
            {offers.length > 1 && (
              <View style={styles.pagination}>
                {offers.map((_, index) => {
                  const activeDotIndex =
                    activeIndex === 0
                      ? offers.length - 1
                      : activeIndex === offers.length + 1
                      ? 0
                      : activeIndex - 1;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index === activeDotIndex
                              ? theme.primary
                              : theme.border,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <Text style={[styles.noOffersText, { color: theme.textSecondary }]}>
            No active offers yet. Create one to see it here!
          </Text>
        )}
      </View>

      <View style={[styles.divider, { borderBottomColor: theme.border }]} />

      <View style={styles.buttonGrid}>
        <DashboardButton
          label="Products"
          icon={<ShoppingBag size={24} color={theme.primary} />}
          onPress={() => router.push({ pathname: '/products' })}
          theme={theme}
        />
        <DashboardButton
          label="Orders"
          icon={<PackageSearch size={24} color={theme.primary} />}
          onPress={() => router.push({ pathname: '/orders' })}
          theme={theme}
        />
        {/* 👇 2. ADDED THE NEW "MANAGE OFFERS" BUTTON */}
        <DashboardButton
          label="Manage Offers"
          icon={<Tag size={24} color={theme.primary} />}
          onPress={() => router.push({ pathname: '/offers' })}
          theme={theme}
        />
        <DashboardButton
          label="Settings"
          icon={<SettingsIcon size={24} color={theme.primary} />}
          onPress={() => router.push({ pathname: '/settings' })}
          theme={theme}
        />
        <DashboardButton
          label="Manage Shop"
          icon={<Layers size={24} color={theme.primary} />}
          onPress={() => alert('Coming Soon')}
          theme={theme}
        />
      </View>
    </ScrollView>
  );
}

function DashboardButton({
  label,
  icon,
  onPress,
  theme,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  theme: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={[styles.cardLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  greetingText: { fontSize: 14, fontWeight: '600' },
  shopName: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  sliderContainer: { marginTop: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  // Wrapper for each slide to handle width correctly with snapToInterval
  slideWrapper: {
    width: width - 32,
    paddingHorizontal: 8, // Creates space between slides
  },
  slide: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  slideTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 12,
    position: 'absolute',
    bottom: 0,
  },
  noOffersText: { textAlign: 'center', marginTop: 20, paddingHorizontal: 16 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  divider: { borderBottomWidth: 1, marginVertical: 24, marginHorizontal: 16 },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: { marginBottom: 10 },
  cardLabel: { fontWeight: '600' },
});
