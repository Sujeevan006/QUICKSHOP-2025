import { AppProvider } from '@/context/AppContext';
import { AuthContext, AuthProvider } from '@/context/AuthContext';
// 👇 Import the raw `themes` object to access the dark theme directly
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
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
  // We still need the dynamic theme for the screen backgrounds
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
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    );
  }

  return (
    <Tabs
      initialRouteName="dashboard/index"
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          elevation: 0, // Remove default shadow on Android for a cleaner look
          shadowOpacity: 0, // Remove default shadow on iOS
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: theme.surface,
          elevation: 0, // Remove shadow for cleaner look
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTitleStyle: {
          color: theme.text,
          fontSize: 18,
          fontWeight: '700',
        },
        headerTintColor: theme.text,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
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
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon color={color} size={size} />
          ),
        }}
      />

      {/* HIDDEN SCREENS - All modal/detail screens */}
      <Tabs.Screen name="auth/login" options={{ href: null }} />
      <Tabs.Screen name="auth/signup" options={{ href: null }} />
      <Tabs.Screen name="products/add-product" options={{ href: null }} />
      <Tabs.Screen name="products/add-offer" options={{ href: null }} />
      <Tabs.Screen name="products/add-category" options={{ href: null }} />
      <Tabs.Screen name="products/manage-category" options={{ href: null }} />
      <Tabs.Screen name="products/layout" options={{ href: null }} />
      <Tabs.Screen name="offers/index" options={{ href: null }} />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
    </Tabs>
  );
}
