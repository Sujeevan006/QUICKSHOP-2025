// app/prebill/index.tsx
import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import api, { SERVER_URL } from '@/services/api';
import { useRouter } from 'expo-router';
import { PrebillShopCard } from '@/components/cards/PrebillShopCard';
import { Shop } from '@/types';
import { SwipeListView, RowMap } from 'react-native-swipe-list-view';
import { X, Trash2, XCircle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

type GroupRow = { shopId: string; shop: Shop; count: number; total: number };

export default function PrebillSummaryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const {
    shoppingList,
    removeFromShoppingList,
    getPackingStatus,
    cancelPackingRequest,
    favoriteShops,
  } = useApp();

  const listRef = useRef<SwipeListView<GroupRow>>(null);

  // Bottom sheets
  const [packSheetOpen, setPackSheetOpen] = useState(false);
  const [packSheetShop, setPackSheetShop] = useState<GroupRow | null>(null);

  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [deleteShopRow, setDeleteShopRow] = useState<GroupRow | null>(null);

  const [fetchedShops, setFetchedShops] = useState<Shop[]>([]);

  // Fetch missing shop details
  useEffect(() => {
    const fetchMissingShops = async () => {
      const shopIds = new Set(
        shoppingList.map((i) =>
          String(i.product.shopId || i.product.shop_id || 'unknown')
        )
      );

      // Filter out IDs we already have in favoriteShops
      const missingIds = Array.from(shopIds).filter(
        (id) =>
          !favoriteShops.find((s) => String(s.id) === id) && id !== 'unknown'
      );

      if (missingIds.length === 0) return;

      try {
        // Fetch all shops (since we don't have bulk fetch by ID yet)
        const res = await api.get('/shops');
        const allShops = Array.isArray(res.data) ? res.data : [];

        const found = allShops
          .filter((s: any) => missingIds.includes(String(s.id)))
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

        setFetchedShops((prev) => {
          // Merge new found shops with existing fetched shops, avoiding duplicates
          const combined = [...prev];
          for (const f of found) {
            if (!combined.find((c) => c.id === f.id)) {
              combined.push(f);
            }
          }
          return combined;
        });
      } catch (error) {
        console.error('Failed to fetch missing shops:', error);
      }
    };

    fetchMissingShops();
  }, [shoppingList, favoriteShops]);

  // Group items by shop
  const groups = useMemo<GroupRow[]>(() => {
    const byShop: Record<
      string,
      { count: number; total: number; shopName?: string }
    > = {};
    for (const item of shoppingList) {
      const sid = String(
        item.product.shopId || item.product.shop_id || 'unknown'
      );
      const price =
        typeof item.product.price === 'number' ? item.product.price : 0;
      if (!byShop[sid]) byShop[sid] = { count: 0, total: 0 };
      byShop[sid].count += 1;
      byShop[sid].total += item.quantity * price;

      // Try to capture shop name from product if available
      if (!byShop[sid].shopName && (item.product as any).shopName) {
        byShop[sid].shopName = (item.product as any).shopName;
      }
    }
    return Object.entries(byShop)
      .map(([shopId, info]) => {
        let shop = favoriteShops.find((s) => String(s.id) === shopId);

        if (!shop) {
          shop = fetchedShops.find((s) => String(s.id) === shopId);
        }

        if (!shop) {
          shop = {
            id: shopId,
            name: info.shopName || `Shop #${shopId}`,
            address: 'Unknown Address',
            isOpen: true,
            rating: 0,
            offers: [],
            category: 'Unknown',
            image: null,
          };
        }

        return { shopId, shop, count: info.count, total: info.total };
      })
      .filter(Boolean) as GroupRow[];
  }, [shoppingList, favoriteShops, fetchedShops]);

  const navigateToShop = useCallback(
    (shopId: string, editing?: boolean) =>
      router.push({
        pathname: '/prebill/[shopId]',
        params: { shopId, ...(editing ? { mode: 'edit' } : {}) },
      }),
    [router]
  );

  const deleteShopGroup = useCallback(
    (shopId: string) => {
      const toRemove = shoppingList.filter(
        (i) => String(i.product.shopId || i.product.shop_id) === shopId
      );
      toRemove.forEach((i) => removeFromShoppingList(String(i.product.id)));
    },
    [shoppingList, removeFromShoppingList]
  );

  const closeRow = (rowMap: RowMap<GroupRow>, key: string) => {
    rowMap[key]?.closeRow?.();
  };

  // Tap on card
  const handleCardPress = (row: GroupRow) => {
    listRef.current?.closeAllOpenRows?.();
    const status = getPackingStatus(row.shopId);
    if (!status) {
      navigateToShop(row.shopId);
      return;
    }
    setPackSheetShop(row);
    setPackSheetOpen(true);
  };

  // Swipe-delete
  const handleDeletePress = (row: GroupRow) => {
    const status = getPackingStatus(row.shopId);
    if (status === 'pending') return; // disabled
    setDeleteShopRow(row);
    setDeleteSheetOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteShopRow) return;
    deleteShopGroup(deleteShopRow.shopId);
    Toast.show({
      type: 'message',
      props: {
        iconOnly: true,
        color: '#ef4444',
        icon: <Trash2 size={20} color="#ef4444" />,
      },
      visibilityTime: 900,
      position: 'bottom',
      bottomOffset: 72,
    });
    listRef.current?.closeAllOpenRows?.();
    setDeleteSheetOpen(false);
    setDeleteShopRow(null);
  };

  const handleCancelPacking = () => {
    if (!packSheetShop) return;
    cancelPackingRequest(packSheetShop.shopId);
    Toast.show({
      type: 'message',
      props: {
        iconOnly: true,
        color: '#ef4444',
        icon: <XCircle size={20} color="#ef4444" />,
      },
      visibilityTime: 900,
      position: 'bottom',
      bottomOffset: 72,
    });
    listRef.current?.closeAllOpenRows?.();
    setPackSheetOpen(false);
    setPackSheetShop(null);
  };

  // Swipe config for centered delete button
  const BTN_SIZE = 44;
  const RIGHT_INSET = 16;
  const rightOpenValue = -(BTN_SIZE + RIGHT_INSET + 8);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {groups.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 16,
              textAlign: 'center',
            }}
          >
            Your Pre-Bill is empty.{'\n'}Add products from any shop to see them
            here.
          </Text>
        </View>
      ) : (
        <SwipeListView
          ref={listRef}
          data={groups}
          keyExtractor={(item) => item.shopId}
          contentContainerStyle={{ paddingVertical: 8 }}
          closeOnRowPress
          closeOnScroll
          friction={12}
          tension={40}
          swipeToOpenPercent={10}
          disableRightSwipe
          stopLeftSwipe={0}
          rightOpenValue={rightOpenValue}
          renderItem={({ item }) => (
            <PrebillShopCard
              shop={item.shop}
              count={item.count}
              total={item.total}
              status={getPackingStatus(item.shopId)}
              onPress={() => handleCardPress(item)}
            />
          )}
          renderHiddenItem={({ item }, rowMap) => {
            const status = getPackingStatus(item.shopId);
            const disabled = status === 'pending';
            const bg = disabled ? '#9CA3AF20' : '#ef444420';
            const border = disabled ? '#9CA3AF55' : '#ef444466';
            const iconColor = disabled ? '#9CA3AF' : '#ef4444';

            return (
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    position: 'absolute',
                    right: RIGHT_INSET,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <TouchableOpacity
                    disabled={disabled}
                    onPress={() => {
                      closeRow(rowMap, item.shopId);
                      handleDeletePress(item);
                    }}
                    style={{
                      width: BTN_SIZE,
                      height: BTN_SIZE,
                      borderRadius: 8,
                      backgroundColor: bg,
                      borderWidth: 1,
                      borderColor: border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={
                      disabled
                        ? 'Delete disabled while packing is pending'
                        : `Delete ${item.shop.name}`
                    }
                  >
                    <Trash2 size={22} color={iconColor} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Packing options sheet */}
      <Modal
        visible={packSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setPackSheetOpen(false);
          listRef.current?.closeAllOpenRows?.();
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              setPackSheetOpen(false);
              listRef.current?.closeAllOpenRows?.();
            }}
          />

          <View
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              paddingBottom: 12,
            }}
          >
            <View
              style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.border,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}
              >
                Packing request
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setPackSheetOpen(false);
                  listRef.current?.closeAllOpenRows?.();
                }}
              >
                <X size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 13,
                paddingHorizontal: 16,
                marginBottom: 8,
              }}
            >
              {packSheetShop
                ? `Choose an action for ${packSheetShop.shop.name}`
                : 'Choose an action'}
            </Text>

            <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
              <TouchableOpacity
                onPress={() => {
                  if (packSheetShop) {
                    setPackSheetOpen(false);
                    listRef.current?.closeAllOpenRows?.();
                    navigateToShop(packSheetShop.shopId, true);
                  }
                }}
                style={{
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>
                  Edit list
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelPacking}
                style={{
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#ef4444',
                  backgroundColor: '#ef444420',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#ef4444', fontWeight: '800' }}>
                  Cancel packing request
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setPackSheetOpen(false);
                  listRef.current?.closeAllOpenRows?.();
                }}
                style={{
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation sheet */}
      <Modal
        visible={deleteSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setDeleteSheetOpen(false);
          listRef.current?.closeAllOpenRows?.();
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              setDeleteSheetOpen(false);
              listRef.current?.closeAllOpenRows?.();
            }}
          />

          <View
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              paddingBottom: 12,
            }}
          >
            <View
              style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.border,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}
              >
                Delete this list?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setDeleteSheetOpen(false);
                  listRef.current?.closeAllOpenRows?.();
                }}
              >
                <X size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 13,
                paddingHorizontal: 16,
                marginBottom: 8,
              }}
            >
              {deleteShopRow
                ? `This will remove all items added for ${deleteShopRow.shop.name}.`
                : 'This will remove all items for this shop.'}
            </Text>

            <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
              <TouchableOpacity
                onPress={confirmDelete}
                style={{
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: '#ef4444',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setDeleteSheetOpen(false);
                  listRef.current?.closeAllOpenRows?.();
                }}
                style={{
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
