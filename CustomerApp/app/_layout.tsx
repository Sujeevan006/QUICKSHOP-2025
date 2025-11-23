// app/_layout.tsx
import React, { useEffect, useContext, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
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
import { AuthContext, AuthProvider } from '@/contexts/AuthContext'; // 👈 ADDED: AuthProvider

import { Home, Store, MapPin, ShoppingCart } from 'lucide-react-native';

function GlobalBottomNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { theme, mode } = useTheme();

  const brand = mode === 'dark' ? '#131313ff' : theme.surface;
  const iconColor = mode === 'dark' ? '#fff' : '#111827';
  const activeBg =
    mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)';
  const labelColor = iconColor;

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
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={{
          padding: 6,
          borderRadius: 999,
          backgroundColor: active ? activeBg : 'transparent',
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          marginTop: 2,
          fontSize: 12,
          fontWeight: '600',
          color: labelColor,
          opacity: active ? 1 : 0.85,
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
        borderTopColor: brand,
        borderTopWidth: 1,
        paddingTop: 4,
        paddingBottom: Math.max(10, insets.bottom),
        height: 76 + insets.bottom,
        flexDirection: 'row',
      }}
    >
      <Item
        icon={<Home size={22} color={iconColor} />}
        label="Home"
        active={isHome}
        onPress={() => go('/')}
      />
      <Item
        icon={<Store size={22} color={iconColor} />}
        label="Shops"
        active={isShops}
        onPress={() => go('/shops')}
      />
      <Item
        icon={<MapPin size={22} color={iconColor} />}
        label="Map"
        active={isMap}
        onPress={() => go('/map')}
      />
      <Item
        icon={<ShoppingCart size={22} color={iconColor} />}
        label="Pre-Bill"
        active={isPrebill}
        onPress={() => go('/prebill')}
      />
    </View>
  );
}

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
          onPressFavorites={() => router.replace('/favorites')}
          onPressSettings={() => router.replace('/settings')}
        />
      )}

      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {!isAuth && <GlobalBottomNav />}
    </SafeAreaView>
  );
}

// 👇 New: Shop Owner Layout
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

      {/* For Shop Owners, you could make a different header/navigation */}
      {!isAuth && (
        <AppHeader
          bgColor={theme.primary}
          tintColor="#ffffff"
          onPressFavorites={() => {}}
          onPressSettings={() => router.replace('/settings')}
        />
      )}

      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* 👇 For now, keep customer bottom nav hidden. 
          Later, you can build custom ShopOwner Nav (like Products, Orders, etc.) */}
    </SafeAreaView>
  );
}

function AppContent() {
  const { user } = useContext(AuthContext);
  return user?.role === 'SHOP_OWNER' ? <ShopOwnerShell /> : <CustomerShell />;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <AppContent />
            <ThemedToast />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
