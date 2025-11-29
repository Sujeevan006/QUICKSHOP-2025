// E:\Axivers\QuickShop-Final\components\cards\ShopCard.tsx

import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { Star, MapPin, Heart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { Shop } from '@/types';
import { SERVER_URL } from '@/services/api';

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
  const { theme } = useTheme();

  // Normalise backend & old‑mock fields
  let rawImage = shop.image || (shop as any).shop_image;
  if (rawImage && !rawImage.startsWith('http')) {
    // Ensure we don't double slash if rawImage starts with /
    // but SERVER_URL does not end with / (it is http://...:5000)
    rawImage = `${SERVER_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  }

  const imageUri =
    rawImage || 'https://cdn-icons-png.flaticon.com/512/3536/3536959.png';

  const name = shop.name || (shop as any).shop_name || 'Unnamed Shop';

  const address = shop.address || (shop as any).shop_address || '';

  const category = shop.category || (shop as any).shop_category || '';

  const openFlag =
    typeof shop.is_open === 'boolean'
      ? shop.is_open
      : typeof shop.isOpen === 'boolean'
      ? shop.isOpen
      : true;

  const rating =
    typeof shop.rating === 'number' && shop.rating > 0 ? shop.rating : 4.0; // default placeholder

  const distanceValue =
    typeof (shop as any).distance === 'number'
      ? (shop as any).distance
      : typeof (shop as any).distanceKm === 'number'
      ? (shop as any).distanceKm
      : undefined;

  const distanceLabel =
    showDistance && typeof distanceValue === 'number'
      ? `${distanceValue.toFixed(1)} km`
      : undefined;

  // -------------
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${name}${
        showOpenBadge ? (openFlag ? ', open' : ', closed') : ''
      }${distanceLabel ? `, ${distanceLabel}` : ''}`}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: '#000',
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
      <View style={{ flex: 1 }}>
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
                  backgroundColor: openFlag ? '#16a34a1A' : '#ef44441A',
                  borderColor: openFlag ? '#16a34a' : '#ef4444',
                },
              ]}
            >
              <Text
                style={{
                  color: openFlag ? '#16a34a' : '#ef4444',
                  fontSize: 10,
                  fontWeight: '800',
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
            <Star size={14} color="#F5A623" fill="#F5A623" />
            <Text style={[styles.metaText, { color: theme.text }]}>
              {rating.toFixed(1)}
            </Text>
          </View>

          {distanceLabel && (
            <View style={styles.metaItem}>
              <MapPin size={14} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {distanceLabel}
              </Text>
            </View>
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
              { color: theme.textSecondary, fontStyle: 'italic' },
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
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={[
            styles.favBtn,
            {
              borderColor: theme.border,
              backgroundColor: theme.surface,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          <Heart
            size={18}
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
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 8,
    marginVertical: 6,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '800',
    marginRight: 8,
  },
  stateChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12.5,
    fontWeight: '600',
  },
  address: {
    fontSize: 12,
    marginTop: 4,
  },
  favBtn: {
    height: 32,
    width: 32,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 2,
    alignSelf: 'flex-start',
  },
});

export const ShopCard = memo(ShopCardComp);
