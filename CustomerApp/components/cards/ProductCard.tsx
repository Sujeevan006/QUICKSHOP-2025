// components/cards/ProductCard.tsx
import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { Product } from '@/types';

type Props = {
  product: Product;
  onPress: () => void;
  showShopName?: boolean;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  testID?: string;
};

export const ProductCard: React.FC<Props> = memo(
  ({
    product,
    onPress,
    showShopName = false,
    containerStyle,
    imageStyle,
    testID,
  }) => {
    const { theme } = useTheme();

    // Guard against missing product
    if (!product) return null;

    const p: any = product;

    const imageUrl: string | undefined =
      p.product_image || product.image || undefined;

    const unitLabel: string | undefined = useMemo(() => {
      const q = p.quantity;
      const ut = p.unit_type;
      const oldUnit = (product as any).unit;
      if (typeof oldUnit === 'string' && oldUnit.trim()) return oldUnit;

      const hasQ = q !== undefined && q !== null && String(q).trim().length > 0;
      const hasUt = typeof ut === 'string' && ut.trim().length > 0;
      if (hasQ && hasUt) return `${q}${ut}`;
      if (hasUt) return ut;
      return undefined;
    }, [p.quantity, p.unit_type, product]);

    const priceValue = Number(p.price ?? product.price ?? 0);

    const availabilityRaw: string = (() => {
      if (typeof p.stock === 'number') {
        return p.stock > 0 ? 'in_stock' : 'out_of_stock';
      }
      const legacy = (p.availability ?? '').toString();
      return legacy.toLowerCase();
    })();

    const danger = (theme as any)?.error || '#ef4444';
    const success = '#16a34a';
    const warning = '#f59e0b';

    const availConfig =
      availabilityRaw === 'out_of_stock'
        ? { label: 'Out of stock', color: danger }
        : availabilityRaw === 'low_stock'
        ? { label: 'Low stock', color: warning }
        : { label: 'In stock', color: success };

    // Dynamic styles based on theme
    const styles = useMemo(() => StyleSheet.create({
      card: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 10,
        margin: 6,
        flex: 1,
        minWidth: 150,
        // maxWidth: '48%', // Removed to allow parent control
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
      },
      image: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginBottom: 8,
      },
      name: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.text,
        textAlign: 'left',
        marginBottom: 4,
        alignSelf: 'stretch',
      },
      price: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 2,
        textAlign: 'left',
        alignSelf: 'stretch',
      },
      unit: {
        fontSize: 12,
        color: theme.textSecondary,
        marginBottom: 4,
        textAlign: 'left',
        alignSelf: 'stretch',
      },
      shop: {
        fontSize: 12,
        color: theme.textSecondary,
        textAlign: 'left',
        marginBottom: 4,
        alignSelf: 'stretch',
      },
      badge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 8,
        alignContent: 'center',
        justifyContent: 'center',
        paddingBottom: 3,
        backgroundColor: `${availConfig.color}1A`,
        borderWidth: 1,
        borderColor: availConfig.color,
      },
      badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: availConfig.color,
        textAlign: 'center',
      },
      placeholder: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginBottom: 8,
        backgroundColor: theme.border,
      },
    }), [theme, availConfig]);

    return (
      <TouchableOpacity
        style={[styles.card, containerStyle]}
        onPress={onPress}
        activeOpacity={0.9}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${availConfig.label}`}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, imageStyle]}
          />
        ) : (
          <View style={[styles.placeholder, imageStyle]} />
        )}

        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.price} numberOfLines={1}>
          Rs. {isFinite(priceValue) ? priceValue.toLocaleString() : '0'}
        </Text>

        {!!unitLabel && (
          <Text style={styles.unit} numberOfLines={1}>
            Unit: {unitLabel}
          </Text>
        )}

        {showShopName && (
          <Text style={styles.shop} numberOfLines={1}>
            {/* Add shop name here if applicable */}
          </Text>
        )}

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{availConfig.label}</Text>
        </View>
      </TouchableOpacity>
    );
  }
);
