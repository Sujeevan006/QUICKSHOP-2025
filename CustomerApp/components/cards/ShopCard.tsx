// components/cards/ShopCard.tsx

import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  Platform,
} from 'react-native';
import { Star, MapPin, Heart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { Shop } from '@/types';

type Props = {
  shop: Shop;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  metaLayout?: 'row' | 'column';
  showAddress?: boolean;
  showDistance?: boolean;
  showOpenBadge?: boolean;
  testID?: string;

  // Favorites
  showFavoriteIcon?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (shop: Shop) => void;
};

const ShopCardComp: React.FC<Props> = ({
  shop,
  onPress,
  containerStyle,
  imageStyle,
  metaLayout = 'row',
  showAddress = true,
  showDistance = true,
  showOpenBadge = true,
  testID,
  showFavoriteIcon = false,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  // Normalise backend & old‑mock fields
  const imageUri =
    shop.image ||
    (shop as any).shop_image ||
    'https://cdn-icons-png.flaticon.com/512/3536/3536959.png';

  const name = shop.name || (shop as any).shop_name || 'Unnamed Shop';
  const address = shop.address || (shop as any).shop_address || '';
  const category = shop.category || (shop as any).shop_category || '';

  const openFlag =
    typeof shop.is_open === 'boolean'
      ? shop.is_open
      : typeof shop.isOpen === 'boolean'
      ? shop.isOpen
      : true;

  const rating =
    typeof shop.rating === 'number' && shop.rating > 0 ? shop.rating : 4.0;

  const distanceValue =
    typeof (shop as any).distance === 'number'
      ? (shop as any).distance
      : typeof (shop as any).distanceKm === 'number'
      ? (shop as any).distanceKm
      : undefined;

  const distanceLabel =
    showDistance && typeof distanceValue === 'number'
      ? `${distanceValue.toFixed(1)} km`
      : undefined;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${name}${
        showOpenBadge ? (openFlag ? ', open' : ', closed') : ''
      }${distanceLabel ? `, ${distanceLabel}` : ''}`}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          // In dark mode, a thin border helps separation. In light mode, shadow is enough.
          borderWidth: isDark ? 1 : 0,
          borderColor: theme.border,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 3,
            },
          }),
        },
        containerStyle,
      ]}
    >
      {/* ---------- Shop Thumbnail ---------- */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[styles.image, imageStyle, { backgroundColor: theme.border }]}
        />
      )}

      {/* ---------- Text Content ---------- */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {/* Name + Open/Closed chip */}
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {name}
          </Text>

          {showOpenBadge && (
            <View
              style={[
                styles.stateChip,
                {
                  backgroundColor: openFlag ? '#16a34a15' : '#ef444415',
                  // Remove border for cleaner look, just use bg
                },
              ]}
            >
              <Text
                style={{
                  color: openFlag ? '#16a34a' : '#ef4444',
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                {openFlag ? 'Open' : 'Closed'}
              </Text>
            </View>
          )}
        </View>

        {/* Rating + Distance row */}
        <View
          style={[
            styles.metaRow,
            metaLayout === 'column' && {
              flexDirection: 'column',
              alignItems: 'flex-start',
            },
          ]}
        >
          <View style={styles.metaItem}>
            <Star size={13} color="#F5A623" fill="#F5A623" />
            <Text style={[styles.metaText, { color: theme.text }]}>
              {rating.toFixed(1)}
            </Text>
          </View>

          {distanceLabel && (
            <>
              <Text style={{ color: theme.textSecondary, marginHorizontal: 4 }}>•</Text>
              <View style={styles.metaItem}>
                <Text style={[styles.metaText, { color: theme.textSecondary, marginLeft: 0 }]}>
                  {distanceLabel}
                </Text>
              </View>
            </>
          )}
        </View>

        {showAddress && !!address && (
          <Text
            style={[styles.address, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {address}
          </Text>
        )}
        {!!category && (
          <Text
            style={[
              styles.address,
              { color: theme.primary, fontWeight: '500', marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {category}
          </Text>
        )}
      </View>

      {/* ---------- Favorite heart ---------- */}
      {showFavoriteIcon && (
        <TouchableOpacity
          onPress={() => onToggleFavorite?.(shop)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={[
            styles.favBtn,
            {
              backgroundColor: isFavorite ? `${theme.primary}15` : 'transparent',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          <Heart
            size={20}
            color={isFavorite ? theme.primary : theme.textSecondary}
            fill={isFavorite ? theme.primary : 'transparent'}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// -------------------------------
// Styles
// -------------------------------
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16, // Increased radius
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 6,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: -0.3,
  },
  stateChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  address: {
    fontSize: 12,
    marginTop: 2,
  },
  favBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export const ShopCard = memo(ShopCardComp);
