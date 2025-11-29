import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ChevronRight,
  Layers,
  PackageSearch,
  Settings as SettingsIcon,
  ShoppingBag,
  Tag,
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
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Offer {
  id: number;
  title: string;
  banner_image_url: string;
}

export default function DashboardScreen() {
  const { user, token } = useContext(AuthContext);
  const theme = useTheme();
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
      }, 4000);

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
      newIndex = sliderData.length - 2;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
    } else if (newIndex === sliderData.length - 1) {
      newIndex = 1;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
    }
    setActiveIndex(newIndex);
  };

  const handleOfferPress = () => {
    router.push('/products?tab=offers');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeInDown.delay(100).duration(600)}
        style={styles.header}
      >
        <View>
          <Text style={[styles.greetingText, { color: theme.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.name || 'Shop Owner'}
          </Text>
        </View>
        <View
          style={[
            styles.shopBadge,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.shopName, { color: theme.primary }]}>
            {shop?.shop_name || 'My Shop'}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(600)}
        style={styles.sliderContainer}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Active Offers
          </Text>
          <TouchableOpacity onPress={() => router.push('/products?tab=offers')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {loadingOffers ? (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: theme.surface },
            ]}
          >
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
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
                  activeOpacity={0.9}
                  onPress={handleOfferPress}
                  style={styles.slideWrapper}
                >
                  <View
                    style={[styles.slide, { backgroundColor: theme.surface }]}
                  >
                    <Image
                      source={{ uri: item.banner_image_url }}
                      style={styles.bannerImage}
                      resizeMode="cover"
                    />
                    <View style={styles.overlay}>
                      <Text style={styles.slideTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                    </View>
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
                          width: index === activeDotIndex ? 24 : 8,
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
          <TouchableOpacity
            onPress={() => router.push('/products?tab=offers')}
            style={[
              styles.emptyState,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Tag
              size={32}
              color={theme.textSecondary}
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.noOffersText, { color: theme.textSecondary }]}>
              No active offers. Tap to create one!
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <View style={styles.menuGrid}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text, paddingHorizontal: 16, marginBottom: 16 },
          ]}
        >
          Quick Actions
        </Text>
        <View style={styles.gridContainer}>
          <DashboardButton
            label="Products"
            subLabel="Manage inventory"
            icon={<ShoppingBag size={24} color="#FFF" />}
            color="#4F46E5"
            delay={300}
            onPress={() => router.push('/products')}
            theme={theme}
          />
          <DashboardButton
            label="Orders"
            subLabel="View & process"
            icon={<PackageSearch size={24} color="#FFF" />}
            color="#F59E0B"
            delay={400}
            onPress={() => router.push('/orders')}
            theme={theme}
          />
          <DashboardButton
            label="Settings"
            subLabel="App preferences"
            icon={<SettingsIcon size={24} color="#FFF" />}
            color="#6366F1"
            delay={500}
            onPress={() => router.push('/settings')}
            theme={theme}
          />
        </View>

        <Animated.View
          entering={FadeInUp.delay(700).duration(600)}
          style={{ paddingHorizontal: 16, marginTop: 8 }}
        >
          <TouchableOpacity
            onPress={() => alert('Coming Soon')}
            style={[
              styles.fullWidthCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[styles.iconCircle, { backgroundColor: theme.background }]}
            >
              <Layers size={20} color={theme.text} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.cardLabel, { color: theme.text }]}>
                Manage Shop Details
              </Text>
              <Text
                style={[styles.cardSubLabel, { color: theme.textSecondary }]}
              >
                Update address, hours, and more
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function DashboardButton({
  label,
  subLabel,
  icon,
  color,
  delay,
  onPress,
  theme,
}: {
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(600)}
      style={styles.gridItem}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          {icon}
        </View>
        <Text style={[styles.cardLabel, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.cardSubLabel, { color: theme.textSecondary }]}>
          {subLabel}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: { fontSize: 14, fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  shopBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  shopName: { fontSize: 12, fontWeight: '700' },
  sliderContainer: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAllText: { fontSize: 14, fontWeight: '600' },
  loadingContainer: {
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideWrapper: { width: width - 32, paddingRight: 16 },
  slide: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerImage: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
  },
  slideTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: { height: 8, borderRadius: 4 },
  emptyState: {
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  noOffersText: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  menuGrid: { marginTop: 24 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItem: { width: '48%' },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSubLabel: { fontSize: 12, fontWeight: '500' },
  fullWidthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
