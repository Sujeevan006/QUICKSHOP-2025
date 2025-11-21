// components/cards/PrebillShopCard.tsx
import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Shop, PackingStatus } from '@/types';

type Props = {
  shop: Shop;
  count: number; // number of products in pre-bill for this shop
  onPress?: () => void;
  total?: number; // show subtotal for this shop (e.g., Rs.)
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  showChevron?: boolean;
  badgeColor?: string; // override badge color (defaults to theme.primary)
  testID?: string;

  // Packing status
  status?: PackingStatus;
};

const PrebillShopCardComp: React.FC<Props> = ({
  shop,
  count,
  onPress,
  total,
  containerStyle,
  imageStyle,
  showChevron = true,
  badgeColor,
  testID,
  status,
}) => {
  const { theme } = useTheme();

  const badgeBg = badgeColor || theme.primary;

  const statusConfig = (() => {
    if (!status) return null;
    if (status === 'pending')
      return { label: 'Packing pending', color: '#f59e0b' };
    if (status === 'processing')
      return { label: 'Packing on process', color: '#0ea5e9' };
    return { label: 'Packing completed', color: '#16a34a' };
  })();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Open pre-bill for ${shop.name}. ${count} item${
        count === 1 ? '' : 's'
      }.`}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 12,
          marginHorizontal: 16,
          marginVertical: 6,
        },
        containerStyle,
      ]}
    >
      {shop.image ? (
        <Image
          source={{ uri: shop.image }}
          style={[
            { width: 52, height: 52, borderRadius: 10, marginRight: 12 },
            imageStyle,
          ]}
        />
      ) : (
        <View
          style={[
            {
              width: 52,
              height: 52,
              borderRadius: 10,
              marginRight: 12,
              backgroundColor: theme.border,
            },
            imageStyle,
          ]}
        />
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}
          numberOfLines={1}
        >
          {shop.name}
        </Text>
        {!!shop.address && (
          <Text
            style={{ color: theme.textSecondary, fontSize: 12 }}
            numberOfLines={1}
          >
            {shop.address}
          </Text>
        )}
        {typeof total === 'number' && (
          <Text
            style={{
              color: theme.text,
              fontSize: 13,
              fontWeight: '700',
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            Rs. {total.toLocaleString()}
          </Text>
        )}

        {/* Packing status pill (optional) */}
        {statusConfig && (
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 6,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: statusConfig.color,
              backgroundColor: `${statusConfig.color}1A`,
            }}
          >
            <Text
              style={{
                color: statusConfig.color,
                fontWeight: '800',
                fontSize: 11,
              }}
            >
              {statusConfig.label}
            </Text>
          </View>
        )}
      </View>

      {/* Right: count badge + chevron */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: badgeBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>
            {count}
          </Text>
        </View>

        {showChevron && <ChevronRight size={18} color={theme.textSecondary} />}
      </View>
    </TouchableOpacity>
  );
};

export const PrebillShopCard = memo(PrebillShopCardComp);
