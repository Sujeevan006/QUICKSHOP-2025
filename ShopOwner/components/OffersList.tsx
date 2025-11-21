import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import { PlusCircle } from 'lucide-react-native';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OffersList() {
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data);
    } catch (e) {
      console.error('Failed to load offers:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOffers();
    }, [])
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={theme.primary}
        style={{ marginTop: 40 }}
      />
    );
  }

  return (
    <View style={[styles.scene, { backgroundColor: theme.background }]}>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/products/add-offer',
                params: { id: item.id },
              })
            }
          >
            <View
              style={[
                styles.offerCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Image
                source={{ uri: item.banner_image_url }}
                style={styles.offerImage}
              />
              <View style={styles.offerDetails}>
                <Text style={[styles.offerTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No offers found. Tap below to create one!
          </Text>
        }
        contentContainerStyle={{ padding: 16 }}
      />
      <TouchableOpacity
        onPress={() => router.push('/products/add-offer')}
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <PlusCircle size={22} color="#fff" />
        <Text style={styles.fabText}>Add Offer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 30, fontSize: 16 },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    margin: 16,
  },
  fabText: { color: '#fff', fontWeight: '700', marginLeft: 6 },
  offerCard: {
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  offerImage: { width: '100%', height: 140 },
  offerDetails: { padding: 12 },
  offerTitle: { fontSize: 16, fontWeight: 'bold' },
});
