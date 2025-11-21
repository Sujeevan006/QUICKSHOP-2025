// app/_layout.tsx
import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemedToast } from '@/components/common/ThemedToast';
import { AppHeader } from '@/components/common/AppHeader';
import { AuthContext } from '@/contexts/AuthContext'; // ✅ used correctly

import { Home, Store, MapPin, ShoppingCart } from 'lucide-react-native';

// ----------------------
// ⏬ Bottom Navigation for Customers
// ----------------------
function GlobalBottomNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  const brand = isDark ? '#131313' : theme.surface;
  const iconColor = isDark ? '#9ca3af' : '#6b7280'; // gray-400 / gray-500
  const activeIconColor = theme.primary;
  const activeBg = isDark ? 'rgba(255,255,255,0.05)' : `${theme.primary}10`; // Very subtle

  const go = (href: string) => {
    if (pathname !== href) router.replace(href);
  };

  const isHome = pathname === '/' || pathname === '/index';
  const isShops = pathname.startsWith('/shops');
  const isMap = pathname.startsWith('/map');
  const isPrebill = pathname.startsWith('/prebill');

  const Item = ({
    icon,
    label,
    active,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 6,
          borderRadius: 20,
          backgroundColor: active ? activeBg : 'transparent',
          marginBottom: 4,
        }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          color: active ? activeIconColor : iconColor,
          size: 24,
        })}
      </View>
      <Text
        style={{
          fontSize: 11,
          fontWeight: active ? '700' : '500',
          color: active ? activeIconColor : iconColor,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        backgroundColor: brand,
        borderTopColor: isDark ? '#222' : theme.border,
        borderTopWidth: 0.5,
        paddingTop: 8,
        paddingBottom: Math.max(8, insets.bottom),
        height: 70 + Math.max(10, insets.bottom), // Adjusted height
        flexDirection: 'row',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          },
          android: {
            elevation: 8,
          },
        }),
      }}
    >
      <Item
        icon={<Home />}
        label="Home"
        active={isHome}
        onPress={() => go('/')}
      />
      <Item
        icon={<Store />}
        label="Shops"
        active={isShops}
        onPress={() => go('/shops')}
      />
      <Item
        icon={<MapPin />}
        label="Map"
        active={isMap}
        onPress={() => go('/map')}
      />
      <Item
        icon={<ShoppingCart />}
        label="Pre-Bill"
        active={isPrebill}
        onPress={() => go('/prebill')}
      />
    </View>
  );
}

// ----------------------
// ✅ Customer Shell with Header + Nav
// ----------------------
function CustomerShell() {
  const { theme, mode } = useTheme();
  const router = useRouter();
  const pathname = usePathname() || '/';
  const isAuth = pathname.startsWith('/auth');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        style={mode === 'dark' ? 'light' : 'dark'}
        backgroundColor={theme.primary}
      />

      {!isAuth && (
        <AppHeader
          bgColor={theme.primary}
          tintColor="#ffffff"
          onPressFavorites={() => router.push('/favorites')}
          onPressSettings={() => router.push('/settings')}
        />
      )}

      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {!isAuth && <GlobalBottomNav />}
    </SafeAreaView>
  );
}

// ----------------------
// ✅ Shop Owner Shell
// ----------------------
function ShopOwnerShell() {
  const { theme, mode } = useTheme();
  const router = useRouter();
  const pathname = usePathname() || '/';
  const isAuth = pathname.startsWith('/auth');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        style={mode === 'dark' ? 'light' : 'dark'}
        backgroundColor={theme.primary}
      />

      {!isAuth && (
        <AppHeader
          bgColor={theme.primary}
          tintColor="#ffffff"
          onPressFavorites={() => {}}
          onPressSettings={() => router.push('/settings')}
        />
      )}

      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* ⛔ BottomNav is **not** shown for Owners (can be added later if needed) */}
    </SafeAreaView>
  );
}

// ----------------------
// ✅ Root Layout
// ----------------------
export default function RootLayout() {
  useFrameworkReady();

  const auth = useContext(AuthContext); // 🔐 Using context directly
  const userRole = auth?.user?.role;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppProvider>
          {/* 🧠 Decide layout based on user.role */}
          {userRole === 'SHOP_OWNER' ? <ShopOwnerShell /> : <CustomerShell />}
          <ThemedToast />
        </AppProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
