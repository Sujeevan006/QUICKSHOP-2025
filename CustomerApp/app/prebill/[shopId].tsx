// app/prebill/[shopId].tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SERVER_URL } from '@/services/api';

import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { SwipeListView, RowMap } from 'react-native-swipe-list-view';

export default function PrebillShopDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { shopId, mode } = useLocalSearchParams<{
    shopId: string;
    mode?: string;
  }>();
  const {
    shoppingList,
    updateShoppingListQuantity,
    removeFromShoppingList,
    favoriteShops,
  } = useApp();

  const isEditing = mode === 'edit' || mode === '1';

  let shop = favoriteShops.find((s) => String(s.id) === shopId);

  if (!shop) {
    const item = shoppingList.find(
      (i) => String(i.product.shopId || i.product.shop_id) === shopId
    );
    if (item) {
      const p: any = item.product;
      shop = {
        id: shopId,
        name: p.shopName || p.shop_name || `Shop #${shopId}`,
        address: 'Unknown Address',
        isOpen: true,
        rating: 0,
        offers: [],
        category: 'Unknown',
        image: null,
      };
    }
  }

  const items = useMemo(
    () =>
      shoppingList.filter(
        (i) => String(i.product.shopId || i.product.shop_id) === shopId
      ),
    [shoppingList, shopId]
  );

  const shopTotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const price = Number(i.product.price) || 0;
        return sum + i.quantity * price;
      }, 0),
    [items]
  );

  const closeRow = (rowMap: RowMap<any>, key: string) => {
    rowMap[key]?.closeRow?.();
  };

  if (!shop) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 16 }}>
          Shop not found.
        </Text>
      </View>
    );
  }

  // Swipe config for centered delete button
  const BTN_SIZE = 44;
  const RIGHT_INSET = 16;
  const rightOpenValue = -(BTN_SIZE + RIGHT_INSET + 8);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Shop info */}

      {/* Items with slide-to-delete per product */}
      {items.length === 0 ? (
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
            No items for this shop in Pre-Bill.
          </Text>
        </View>
      ) : (
        <SwipeListView
          data={items}
          keyExtractor={(i) => String(i.product.id)}
          contentContainerStyle={{ paddingVertical: 8 }}
          disableRightSwipe
          stopLeftSwipe={0}
          rightOpenValue={rightOpenValue}
          friction={12}
          tension={40}
          swipeToOpenPercent={10}
          renderItem={({ item }) => {
            const price = Number(item.product.price) || 0;
            const subtotal = price * item.quantity;

            const rawImage =
              (item.product as any).product_image || item.product.image;
            const imageUrl = rawImage
              ? rawImage.startsWith('http')
                ? rawImage
                : (() => {
                    const cleanPath = rawImage.replace(/\\/g, '/');
                    return `${SERVER_URL}${
                      cleanPath.startsWith('/') ? '' : '/'
                    }${cleanPath}`;
                  })()
              : null;

            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 16,
                  marginVertical: 6,
                  backgroundColor: theme.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  padding: 10,
                }}
              >
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      marginRight: 12,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      marginRight: 12,
                      backgroundColor: theme.border,
                    }}
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: theme.text, fontWeight: '700' }}
                    numberOfLines={2}
                  >
                    {item.product.name}
                  </Text>
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {item.product.unit ? `Unit: ${item.product.unit}` : ''}
                  </Text>

                  {/* Quantity controls + subtotal */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        updateShoppingListQuantity(
                          String(item.product.id),
                          Math.max(0, item.quantity - 1)
                        )
                      }
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.surface,
                      }}
                      accessibilityLabel="Decrease quantity"
                    >
                      <Minus size={18} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <Text
                      style={{
                        width: 40,
                        textAlign: 'center',
                        color: theme.text,
                        fontSize: 16,
                      }}
                    >
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        updateShoppingListQuantity(
                          String(item.product.id),
                          item.quantity + 1
                        )
                      }
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.surface,
                      }}
                      accessibilityLabel="Increase quantity"
                    >
                      <Plus size={18} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <View
                      style={{ marginLeft: 'auto', alignItems: 'flex-end' }}
                    >
                      <Text
                        style={{ color: theme.textSecondary, fontSize: 12 }}
                      >
                        Subtotal
                      </Text>
                      <Text style={{ color: theme.text, fontWeight: '800' }}>
                        Rs. {subtotal.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
          renderHiddenItem={({ item }, rowMap) => (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    closeRow(rowMap, String(item.product.id));
                    removeFromShoppingList(String(item.product.id));
                  }}
                  activeOpacity={0.9}
                  style={{
                    width: BTN_SIZE,
                    height: BTN_SIZE,
                    backgroundColor: '#ef444420',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#ef444466',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.product.name}`}
                >
                  <Trash2 size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Bottom summary */}
      {items.length > 0 && (
        <View
          style={{
            backgroundColor: theme.surface,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.text, fontWeight: '700' }}>
            Rs. {shopTotal.toLocaleString()}
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/prebill/bill',
                params: {
                  shopId: String(shopId),
                  editing: isEditing ? '1' : '0',
                },
              })
            }
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
            }}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? 'Update list' : 'Proceed to bill'}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>
              {isEditing ? 'Update list' : 'Proceed'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
