import { AppProvider } from '@/context/AppContext';
import { AuthContext, AuthProvider } from '@/context/AuthContext';
// 👇 Import the raw `themes` object to access the dark theme directly
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
  // We still need the dynamic theme for the screen backgrounds
  const  theme  = useTheme();

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
        // 👇 Here we hardcode the DARK THEME colors for navigation
        tabBarStyle: {
          backgroundColor: themes.dark.surface, // Always dark surface
          borderTopColor: themes.dark.border, // Always dark border
          paddingBottom: 8, // Added bottom padding
          paddingTop: 4, // Added top padding
          height: 65, // Increase height to accommodate padding
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: themes.dark.surface, // Always dark header
        },
        headerTitleStyle: {
          color: themes.dark.text, // Always light text on header
          fontSize: 18,
          fontWeight: '700',
        },
        headerTintColor: themes.dark.text, // Color for back button, etc.
        tabBarActiveTintColor: themes.dark.primary, // Active tab icon color
        tabBarInactiveTintColor: themes.dark.textSecondary, // Inactive tab icon
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

      {/* HIDDEN SCREENS */}
      <Tabs.Screen name="auth/login" options={{ href: null }} />
      <Tabs.Screen name="auth/signup" options={{ href: null }} />
      <Tabs.Screen name="products/add-product" options={{ href: null }} />
      <Tabs.Screen name="products/add-offer" options={{ href: null }} />
    </Tabs>
  );
}
