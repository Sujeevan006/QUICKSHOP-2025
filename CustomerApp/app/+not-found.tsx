// app/+not-found.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertTriangle } from 'lucide-react-native';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${theme.primary}1A`, // ~10% alpha
          marginBottom: 16,
        }}
      >
        <AlertTriangle size={32} color={theme.primary} />
      </View>

      <Text
        style={{
          color: theme.text,
          fontSize: 20,
          fontWeight: '800',
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        Page not found
      </Text>
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        We couldn’t find the page you’re looking for.
      </Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
          }}
          accessibilityRole="button"
          accessibilityLabel="Go to Home"
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>Go Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/shops')}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
          }}
          accessibilityRole="button"
          accessibilityLabel="Browse shops"
        >
          <Text style={{ color: theme.text, fontWeight: '700' }}>
            Browse shops
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
