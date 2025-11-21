// app/_layout.tsx

import { AppProvider } from '@/context/AppContext';
import { AuthContext, AuthProvider } from '@/context/AuthContext';
import { ThemeProvider, themes, useTheme } from '@/context/ThemeContext';
import { Stack, Tabs } from 'expo-router';
import {
  Home,
  Package,
  Settings as SettingsIcon,
  ShoppingBag,
} from 'lucide-react-native';
import { useContext } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          <LayoutRouter />
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}

function LayoutRouter() {
  const { user, loading } = useContext(AuthContext);
  const theme = useTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 8, color: theme.textSecondary }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>
    );
  }

  return (
    <Tabs
      initialRouteName="dashboard/index"
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: themes.dark.surface,
          borderTopColor: themes.dark.border,
          paddingBottom: 8,
          paddingTop: 4,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: themes.dark.surface,
        },
        headerTitleStyle: {
          color: themes.dark.text,
          fontSize: 18,
          fontWeight: '700',
        },
        headerTintColor: themes.dark.text,
        tabBarActiveTintColor: themes.dark.primary,
        tabBarInactiveTintColor: themes.dark.textSecondary,
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Near Buy Seller',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Manage Store',
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: 'Orders',
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Package color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon color={color} size={size} />
          ),
        }}
      />

      {/* 🚫 Hidden routes not to appear in tabs */}
      <Tabs.Screen name="auth/login" options={{ href: null }} />
      <Tabs.Screen name="auth/signup" options={{ href: null }} />
      <Tabs.Screen name="products/add-product" options={{ href: null }} />
      <Tabs.Screen name="products/add-category" options={{ href: null }} />
      <Tabs.Screen name="products/add-offer" options={{ href: null }} />
      <Tabs.Screen name="products/layout" options={{ href: null }} />
      <Tabs.Screen name="offers/index" options={{ href: null }} />
      <Tabs.Screen name="products/manage-category" options={{ href: null }} />
    </Tabs>
  );
}
