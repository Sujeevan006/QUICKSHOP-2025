// components/modals/ProductDetailModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Product } from '@/types';
import { useApp } from '@/contexts/AppContext';
import {
  X as CloseIcon,
  Minus as MinusIcon,
  Plus as PlusIcon,
  Heart as HeartIcon,
  ShoppingCart,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

type Props = {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
};

export const ProductDetailModal: React.FC<Props> = ({
  visible,
  product,
  onClose,
}) => {
  const { theme } = useTheme();
  const { addToPrebill, isProductWishlisted, toggleWishlistProduct } = useApp();

  const [qty, setQty] = useState(1);

  const p: any = product || {};
  const imageUrl: string | undefined = p.product_image || p.image || undefined;

  const unitLabel: string | undefined = useMemo(() => {
    const q = p.quantity;
    const ut = p.unit_type;
    const oldUnit = p.unit;

    const hasQ = q !== undefined && q !== null && String(q).trim().length > 0;
    const hasUt = typeof ut === 'string' && ut.trim().length > 0;
    if (hasQ && hasUt) return `${q}${ut}`;
    if (hasUt) return ut;
    if (typeof oldUnit === 'string' && oldUnit.trim()) return oldUnit;
    return undefined;
  }, [p.quantity, p.unit_type, p.unit]);

  const price: number = Number(p.price ?? 0);
  const inStock: boolean =
    typeof p.stock === 'number'
      ? p.stock > 0
      : p.availability !== 'out_of_stock';
  const total = (isFinite(price) ? price : 0) * qty;

  const wishlisted = product ? isProductWishlisted(String(product.id)) : false;

  useEffect(() => {
    setQty(1);
  }, [product?.id]);

  const onMinus = () => setQty((q) => Math.max(1, q - 1));
  const onPlus = () => setQty((q) => Math.min(99, q + 1));

  const onAdd = () => {
    if (!product) return;

    addToPrebill(product, qty);

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

    onClose();
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.35)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        {/* Card */}
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
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: '700', color: theme.text }}
            >
              {product.name}
            </Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close">
              <CloseIcon size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            {!!imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                resizeMode="cover"
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              />
            )}

            {/* Shop + Availability */}
            <View
              style={{
                marginTop: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                {!!product?.shop?.shop_name && (
                  <Text style={{ fontSize: 14, color: theme.text }}>
                    From {product.shop.shop_name}
                  </Text>
                )}
                {!!unitLabel && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Unit: {unitLabel}
                  </Text>
                )}
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: inStock ? '#16a34a' : '#ef4444',
                  backgroundColor: inStock ? '#16a34a20' : '#ef444420',
                }}
              >
                <Text
                  style={{
                    color: inStock ? '#16a34a' : '#ef4444',
                    fontWeight: '700',
                    fontSize: 12,
                  }}
                >
                  {inStock ? 'In stock' : 'Out of stock'}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View style={{ marginTop: 12 }}>
              <Text
                style={{ fontSize: 22, fontWeight: '800', color: theme.text }}
              >
                Rs. {isFinite(price) ? price.toLocaleString() : '0'}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.textSecondary,
                  marginTop: 2,
                }}
              >
                Inclusive of taxes, if applicable
              </Text>
            </View>

            {/* Quantity selector */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text
                style={{ fontSize: 14, color: theme.text, marginRight: 12 }}
              >
                Quantity
              </Text>
              <TouchableOpacity
                onPress={onMinus}
                disabled={qty <= 1}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: qty <= 1 ? theme.background : theme.surface,
                }}
                accessibilityLabel="Decrease quantity"
              >
                <MinusIcon size={18} color={theme.textSecondary} />
              </TouchableOpacity>
              <Text
                style={{
                  width: 40,
                  textAlign: 'center',
                  fontSize: 16,
                  color: theme.text,
                }}
              >
                {qty}
              </Text>
              <TouchableOpacity
                onPress={onPlus}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.surface,
                }}
                accessibilityLabel="Increase quantity"
              >
                <PlusIcon size={18} color={theme.textSecondary} />
              </TouchableOpacity>
              <View style={{ marginLeft: 'auto' }}>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  Total
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: '800', color: theme.text }}
                >
                  Rs. {isFinite(total) ? total.toLocaleString() : '0'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View
              style={{ flexDirection: 'row', marginTop: 16, marginBottom: 12 }}
            >
              <TouchableOpacity
                disabled={!inStock}
                onPress={onAdd}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: inStock ? theme.primary : theme.border,
                  paddingVertical: 12,
                  borderRadius: 10,
                  marginRight: 8,
                }}
                accessibilityRole="button"
                accessibilityLabel="Add to Pre-Bill"
              >
                <ShoppingCart size={18} color="#fff" />
                <Text
                  style={{ color: '#fff', fontWeight: '800', marginLeft: 8 }}
                >
                  Add to Pre-Bill
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleWishlistProduct(product)}
                style={{
                  width: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 10,
                }}
                accessibilityRole="button"
                accessibilityLabel={
                  wishlisted ? 'Remove from wishlist' : 'Add to wishlist'
                }
              >
                <HeartIcon
                  size={22}
                  color={wishlisted ? '#ef4444' : theme.textSecondary}
                  fill={wishlisted ? '#ef4444' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
