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

export default function ProductsList() {
  const { token } = useContext(AuthContext);
  const  theme  = useTheme();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (e: any) {
      console.error('Fetch products error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
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
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/products/add-product',
                params: { id: item.id },
              })
            }
          >
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {item.product_image ? (
                <Image
                  source={{ uri: item.product_image }}
                  style={styles.image}
                />
              ) : (
                <View
                  style={[
                    styles.imagePlaceholder,
                    { backgroundColor: theme.background },
                  ]}
                />
              )}
              <View style={styles.detailsContainer}>
                <Text style={[styles.name, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text style={{ color: theme.textSecondary }}>
                  Rs. {item.price} - Stock: {item.stock}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No products found. Tap below to add one!
          </Text>
        }
        contentContainerStyle={{ padding: 16 }}
      />
      <TouchableOpacity
        onPress={() => router.push('/products/add-product')}
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <PlusCircle size={22} color="#fff" />
        <Text style={styles.fabText}>Add Product</Text>
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
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  detailsContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
});
