// components/common/AppHeader.tsx
import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { ArrowLeft, ChevronLeft, Heart, Settings } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter, usePathname } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

type Props = {
  title?: string;
  subtitle?: string;
  containerStyle?: StyleProp<ViewStyle>;

  // Actions (overridable)
  onPressFavorites?: () => void;
  onPressSettings?: () => void;
  onPressBack?: () => void;

  // Brand styling
  bgColor?: string; // e.g., '#0f172a'
  tintColor?: string; // e.g., '#fff'
  centerTitle?: boolean;
  elevated?: boolean; // shadow when true (default true if bgColor provided)

  // Visibility
  showFavoritesButton?: boolean; // default true
  showSettingsButton?: boolean; // default true
  showBackButton?: boolean | 'auto'; // default 'auto' (hidden on Home)
};

export const AppHeader: React.FC<Props> = memo(
  ({
    title = 'Near Buy',
    subtitle = 'Find nearby shops in Sri Lanka',
    containerStyle,

    onPressFavorites,
    onPressSettings,
    onPressBack,

    bgColor,
    tintColor,
    centerTitle = false,
    elevated,

    showFavoritesButton = true,
    showSettingsButton = true,
    showBackButton = 'auto',
  }) => {
    const { theme } = useTheme();
    const router = useRouter();
    const pathname = usePathname() || '/';
    const navigation = useNavigation();

    const isSolid = !!bgColor;
    const headerBg = bgColor ?? theme.surface;
    const textColor = tintColor ?? (isSolid ? '#fff' : theme.text);
    const subTextColor = isSolid
      ? 'rgba(255,255,255,0.9)'
      : theme.textSecondary;
    const showShadow = elevated ?? isSolid;

    const isHome = pathname === '/' || pathname === '/index';
    const isShopDetail =
      pathname.startsWith('/shops/') && pathname !== '/shops';

    const autoBackVisible = !isHome;
    const backVisible =
      showBackButton === 'auto' || showBackButton === undefined
        ? autoBackVisible
        : !!showBackButton;

    const goto = (path: string) => {
      if (pathname !== path) router.push(path);
    };

    const handleFavorites = () => {
      if (onPressFavorites) return onPressFavorites();
      goto('/favorites');
    };

    const handleSettings = () => {
      if (onPressSettings) return onPressSettings();
      goto('/settings');
    };

    const handleBack = () => {
      if (onPressBack) return onPressBack();

      // Back
      if ((navigation as any)?.canGoBack?.()) {
        (navigation as any).goBack();
        return;
      }

      // 2) Fallbacks by route
      if (isShopDetail) {
        // e.g. /shops/123 -> /shops
        router.replace('/shops');
        return;
      }

      // 3) Generic fallback to home
      router.replace('/');
    };

    return (
      <View
        style={[
          {
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: headerBg,
            borderBottomWidth: isSolid ? 0 : 1,
            borderBottomColor: isSolid ? headerBg : theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            ...(showShadow
              ? Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOpacity: 0.12,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                  },
                  android: { elevation: 4 },
                })
              : {}),
            marginBottom: 6,
          },
          containerStyle,
        ]}
      >
        {/* Left: Back button (no spacer when hidden) */}
        {backVisible ? (
          <TouchableOpacity
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            style={{ marginRight: 8 }}
          >
            <ChevronLeft size={22} color={textColor} />
          </TouchableOpacity>
        ) : null}

        {/* Title area */}
        <View
          style={{ flex: 1, alignItems: centerTitle ? 'center' : 'flex-start' }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: textColor,
              marginBottom: subtitle ? 2 : 0,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text
              style={{ fontSize: 12, color: subTextColor }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right: Favorites + Settings */}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}
        >
          {showFavoritesButton && (
            <TouchableOpacity
              onPress={handleFavorites}
              style={{ marginRight: 16 }}
              accessibilityRole="button"
              accessibilityLabel="Favorites"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Heart size={22} color={textColor} />
            </TouchableOpacity>
          )}
          {showSettingsButton && (
            <TouchableOpacity
              onPress={handleSettings}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Settings size={22} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);
