import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Store } from 'lucide-react-native';
import api from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import type { Shop } from '@/types';

export default function MapScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
    lat?: string;
    lng?: string;
  }>();
  const [region, setRegion] = useState<any>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const targetId = params.id ? Number(params.id) : null;
  const targetLat = params.lat ? Number(params.lat) : null;
  const targetLng = params.lng ? Number(params.lng) : null;

  // Request permission & get current position
  const fetchLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'Location permission is required.');
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const fetchShops = async () => {
    try {
      const res = await api.get('/shops');
      setShops(res.data);
    } catch (err) {
      console.error('Load shops failed:', err);
    }
  };

  // Run once initially
  useEffect(() => {
    (async () => {
      await Promise.allSettled([fetchLocation(), fetchShops()]);
      setLoading(false);
    })();
  }, []);

  // 👉 Re‑center when navigated from shop details
  useFocusEffect(
    React.useCallback(() => {
      if (targetLat && targetLng) {
        setRegion({
          latitude: targetLat,
          longitude: targetLng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }, [targetLat, targetLng])
  );

  if (loading || !region) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: 10 }}>
          Loading map…
        </Text>
      </View>
    );
  }

  // If opened with shop ID → show only that shop, else all
  const visibleShops = targetId
    ? shops.filter((s) => Number(s.id) === targetId)
    : shops;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={region}
        showsUserLocation
        showsMyLocationButton
      >
        {visibleShops.map((shop) => {
          const lat = Number(shop.latitude);
          const lng = Number(shop.longitude);
          if (!lat || !lng) return null;
          const name = shop.shop_name || shop.name || 'Shop';
          const addr = shop.shop_address || shop.address || '';
          return (
            <Marker
              key={shop.id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={name}
              description={addr}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 18,
                  padding: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Store size={22} color="#E32636" fill="#E32636" />
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}
