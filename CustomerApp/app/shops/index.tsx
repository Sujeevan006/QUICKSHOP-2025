// app/shops/index.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ShopCard } from '@/components/cards/ShopCard';
import type { Shop } from '@/types';
import { SearchBar } from '@/components/common/SearchBar';
import {
  Filter as FilterIcon,
  X as CloseIcon,
  Check,
} from 'lucide-react-native';
import api from '@/services/api'; // 👈 we’ll call backend /api/shops

// -------------------------

type FilterKey =
  | 'all'
  | 'nearest'
  | 'grocery'
  | 'saloon'
  | 'electronics'
  | 'vehicleRepair'
  | 'pharmacy'
  | 'bakery';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All shops' },
  { key: 'nearest', label: 'Nearest shops' },
  { key: 'grocery', label: 'Grocery shops' },
  { key: 'saloon', label: 'Saloon' },
  { key: 'electronics', label: 'Electronic shops' },
  { key: 'vehicleRepair', label: 'Vehicle repair shops' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'bakery', label: 'Bakery' },
];

// -------------------------

export default function ShopsListScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const params = useLocalSearchParams<{ q?: string; filter?: FilterKey }>();
  const initialQ = typeof params.q === 'string' ? params.q : '';
  const initialFilter =
    typeof params.filter === 'string' ? (params.filter as FilterKey) : 'all';

  // Actual data from backend
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(initialQ);
  const [selectedFilter, setSelectedFilter] =
    useState<FilterKey>(initialFilter);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Fetch shops from backend
  const loadShops = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.get('/shops');
      setShops(res.data);
    } catch (err: any) {
      console.error('Shops fetch error:', err.message);
      setError('Failed to fetch shops. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShops();
    setRefreshing(false);
  };

  // -------------------------------------------------
  // Filtering logic (mostly unchanged)
  const filteredShops = useMemo(() => {
    let list = shops.filter((shop) =>
      shop.shop_name?.toLowerCase().includes(search.trim().toLowerCase())
    );

    const cat = (s: any) => ((s?.shop_category as string) || '').toLowerCase();

    switch (selectedFilter) {
      case 'grocery':
        list = list.filter((s) => cat(s).includes('groc'));
        break;
      case 'saloon':
        list = list.filter(
          (s) => cat(s).includes('salon') || cat(s).includes('saloon')
        );
        break;
      case 'electronics':
        list = list.filter((s) => cat(s).includes('elect'));
        break;
      case 'vehicleRepair':
        list = list.filter(
          (s) =>
            cat(s).includes('vehicle') ||
            cat(s).includes('repair') ||
            cat(s).includes('mechanic')
        );
        break;
      case 'pharmacy':
        list = list.filter((s) => cat(s).includes('pharm'));
        break;
      case 'bakery':
        list = list.filter((s) => cat(s).includes('baker'));
        break;
      case 'nearest': {
        const hasDistance =
          list.some((s: any) => typeof (s as any).distance === 'number') ||
          list.some((s: any) => typeof (s as any).distanceKm === 'number');
        if (hasDistance) {
          const getDist = (s: any) => s.distance ?? s.distanceKm ?? 999;
          const within5 = list.filter((s: any) => getDist(s) <= 5);
          list = (within5.length > 0 ? within5 : list).sort(
            (a: any, b: any) => getDist(a) - getDist(b)
          );
        }
        break;
      }
      default:
        break;
    }

    return list;
  }, [shops, search, selectedFilter]);
  // -------------------------------------------------

  const sectionTitle =
    selectedFilter === 'all'
      ? 'Nearby Shops'
      : FILTER_OPTIONS.find((o) => o.key === selectedFilter)?.label ||
        'Nearby Shops';

  const handleShopPress = useCallback(
    (shop: Shop) => {
      router.push({ pathname: '/shops/[id]', params: { id: shop.id } });
    },
    [router]
  );

  // -------------------------------------------------
  // Styles
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    optionText: { fontSize: 16, color: theme.text },
    optionSubtle: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
    optionLeft: { flexDirection: 'column', flex: 1, marginRight: 12 },
    applyRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingTop: 8,
      gap: 12,
    },
    applyBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: theme.primary,
    },
    applyBtnText: { color: '#fff', fontWeight: '700' },
    clearBtn: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    clearBtnText: { color: theme.textSecondary, fontWeight: '700' },
    errorText: {
      color: 'red',
      paddingHorizontal: 16,
      marginTop: 10,
    },
  });
  // -------------------------------------------------

  if (loading && shops.length === 0) {
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
          Loading shops...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={filteredShops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ShopCard shop={item} onPress={() => handleShopPress(item)} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 16 }}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search shops..."
              showClearIcon={false}
              rightAccessory={
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {search.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearch('')}
                      accessibilityLabel="Clear search"
                      style={{
                        backgroundColor: theme.primary,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        marginRight: 8,
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>
                        Clear
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => setFilterModalVisible(true)}
                    accessibilityLabel="Open filters"
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
                </View>
              }
            />
          </>
        }
        ListEmptyComponent={
          <Text
            style={{
              color: theme.textSecondary,
              marginHorizontal: 16,
              marginTop: 12,
            }}
          >
            No shops found.
          </Text>
        }
      />

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setFilterModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <CloseIcon size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {FILTER_OPTIONS.map((opt) => {
              const isActive = selectedFilter === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => {
                    setSelectedFilter(opt.key);
                    setFilterModalVisible(false);
                  }}
                  style={styles.optionRow}
                >
                  <View style={styles.optionLeft}>
                    <Text
                      style={[
                        styles.optionText,
                        { color: isActive ? theme.primary : theme.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {opt.key === 'nearest' && (
                      <Text style={styles.optionSubtle}>
                        If distance data exists, shows shops within 5 km (or
                        nearest)
                      </Text>
                    )}
                  </View>
                  {isActive ? <Check size={20} color={theme.primary} /> : null}
                </TouchableOpacity>
              );
            })}

            <View style={styles.applyRow}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilter('all');
                  setFilterModalVisible(false);
                }}
                style={styles.clearBtn}
              >
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.applyBtn}
              >
                <Text style={styles.applyBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
