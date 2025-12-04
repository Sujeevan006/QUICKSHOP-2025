// app/prebill/bill.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient, { SERVER_URL } from '@/services/api';
import { Shop } from '@/types';

import Toast from 'react-native-toast-message';
import { X, Package } from 'lucide-react-native';

export default function PrebillBillScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { shoppingList, requestPacking, favoriteShops } = useApp();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [fetchedShop, setFetchedShop] = useState<Shop | null>(null);

  // Fetch shop details if not in favorites
  React.useEffect(() => {
    const fetchShop = async () => {
      if (favoriteShops.find((s) => String(s.id) === shopId)) return;

      try {
        const res = await apiClient.get('/shops');
        const allShops = Array.isArray(res.data) ? res.data : [];
        const found = allShops.find((s: any) => String(s.id) === shopId);

        if (found) {
          setFetchedShop({
            ...found,
            id: String(found.id),
            name: found.shop_name || found.name,
            address: found.shop_address || found.address,
            category: found.shop_category || found.category,
            image: found.image
              ? found.image.startsWith('http')
                ? found.image
                : `${SERVER_URL}${found.image.startsWith('/') ? '' : '/'}${
                    found.image
                  }`
              : null,
            isOpen: found.is_open,
            rating: found.rating,
          });
        }
      } catch (error) {
        console.error('Failed to fetch shop details:', error);
      }
    };

    fetchShop();
  }, [shopId, favoriteShops]);

  let shop = favoriteShops.find((s) => String(s.id) === shopId) || fetchedShop;

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

  const subtotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const price = Number(i.product.price) || 0;
        return sum + i.quantity * price;
      }, 0),
    [items]
  );

  // These can be made editable later
  const discount = 0; // Rs.
  const packingFee = 0; // Rs.
  const grandTotal = Math.max(0, subtotal - discount + packingFee);

  const invoiceId = useMemo(() => `INV-${Date.now().toString().slice(-6)}`, []);
  const dateStr = useMemo(() => {
    const d = new Date();
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }, []);

  const sendRequest = () => {
    requestPacking(String(shopId));
    Toast.show({
      type: 'message',
      props: {
        iconOnly: true,
        color: theme.primary,
        icon: <Package size={20} color={theme.primary} />,
      },
      visibilityTime: 900,
      position: 'bottom',
      bottomOffset: 72,
    });
    setConfirmOpen(false);
    router.replace('/prebill');
  };

  if (!shop) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ color: theme.textSecondary }}>Shop not found.</Text>
      </View>
    );
  }

  const Divider = ({
    dashed = false,
    mt = 10,
    mb = 10,
  }: {
    dashed?: boolean;
    mt?: number;
    mb?: number;
  }) => (
    <View
      style={{
        height: 1,
        backgroundColor: dashed ? 'transparent' : theme.border,
        marginTop: mt,
        marginBottom: mb,
      }}
    >
      {dashed ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 1,
            borderStyle: 'dashed',
            borderTopWidth: 1,
            borderColor: theme.border,
          }}
        />
      ) : null}
    </View>
  );

  const SummaryRow = ({
    left,
    right,
    strong,
    compact,
  }: {
    left: string;
    right: string;
    strong?: boolean;
    compact?: boolean;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: compact ? 4 : 6,
      }}
    >
      <Text
        style={{
          color: theme.text,
          fontSize: compact ? 13 : 14,
          fontWeight: strong ? '800' : '600',
        }}
      >
        {left}
      </Text>
      <Text
        style={{
          color: theme.text,
          fontSize: compact ? 13 : 14,
          fontWeight: strong ? '800' : '700',
        }}
      >
        {right}
      </Text>
    </View>
  );

  // Subtle tinted backgrounds for totals
  const totalsBg = `${theme.primary}0D`; // ~5% alpha
  const grandBg = `${theme.primary}1A`; // ~10% alpha

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Bill header */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            padding: 14,
          }}
        >
          <Text
            style={{ color: theme.text, fontWeight: '800', fontSize: 18 }}
            numberOfLines={1}
          >
            {shop.name}
          </Text>
          {!!shop.address && (
            <Text
              style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}
              numberOfLines={2}
            >
              {shop.address}
            </Text>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              {invoiceId}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              {dateStr}
            </Text>
          </View>
        </View>

        {/* Items section */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            marginTop: 12,
            padding: 14,
          }}
        >
          {/* Centered title */}
          <Text
            style={{
              color: theme.text,
              fontWeight: '800',
              marginBottom: 6,
              fontSize: 16,
              textAlign: 'center',
            }}
          >
            Products summary & Bill
          </Text>

          <Divider dashed mt={6} mb={10} />

          {items.map((i, idx) => {
            const name = i.product.name;
            const qty = i.quantity;
            const price = Number(i.product.price) || 0;
            const lineTotal = qty * price;
            const unit = i.product.unit ? ` / ${i.product.unit}` : '';

            return (
              <View
                key={i.product.id}
                style={{ marginBottom: idx === items.length - 1 ? 0 : 12 }}
              >
                {/* Row 1: name (left) + amount (right) */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text
                      style={{ color: theme.text, fontWeight: '500' }}
                      numberOfLines={2}
                    >
                      {name}
                    </Text>
                  </View>
                  <View style={{ width: 120 }}>
                    <Text
                      style={{
                        color: theme.text,
                        textAlign: 'right',
                        fontWeight: '500',
                      }}
                    >
                      Rs. {lineTotal.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Row 2: qty x price under the name (left aligned) */}
                <View style={{ marginTop: 2 }}>
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 12,
                    }}
                    numberOfLines={1}
                  >
                    {qty} x Rs. {price.toLocaleString()}
                    {unit}
                  </Text>
                </View>

                {idx !== items.length - 1 && <Divider dashed mt={8} mb={0} />}
              </View>
            );
          })}
        </View>

        {/* Totals section with subtle background */}
        <View
          style={{
            backgroundColor: totalsBg,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            marginTop: 12,
            padding: 14,
          }}
        >
          <SummaryRow
            left="Subtotal"
            right={`Rs. ${subtotal.toLocaleString()}`}
          />
          <SummaryRow
            left="Discount"
            right={`- Rs. ${discount.toLocaleString()}`}
            compact
          />
          <SummaryRow
            left="Packing fee"
            right={`Rs. ${packingFee.toLocaleString()}`}
            compact
          />

          {/* Grand total row with slightly stronger tint */}
          <View
            style={{
              backgroundColor: grandBg,
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 12,
              marginTop: 10,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <SummaryRow
              left="Grand total"
              right={`Rs. ${grandTotal.toLocaleString()}`}
              strong
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
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
          <Text style={{ color: theme.text, fontWeight: '800', fontSize: 16 }}>
            Rs. {grandTotal.toLocaleString()}
          </Text>

          <TouchableOpacity
            onPress={() => setConfirmOpen(true)}
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
            }}
            accessibilityRole="button"
            accessibilityLabel="Request to packing"
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>
              Request to packing
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirm bottom sheet */}
      <Modal
        visible={confirmOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmOpen(false)}
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
            onPress={() => setConfirmOpen(false)}
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
                Confirm packing request
              </Text>
              <TouchableOpacity onPress={() => setConfirmOpen(false)}>
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
              {`Send packing request to ${shop.name}?`}
            </Text>

            <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: theme.textSecondary }}>Items</Text>
                <Text style={{ color: theme.text, fontWeight: '700' }}>
                  {items.length}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: theme.textSecondary }}>Grand total</Text>
                <Text style={{ color: theme.text, fontWeight: '800' }}>
                  Rs. {grandTotal.toLocaleString()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={sendRequest}
                style={{
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>
                  Send request
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setConfirmOpen(false)}
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
                  Not now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
