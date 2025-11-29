import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import { Package, Plus } from 'lucide-react-native';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProductsList() {
  const { token, loading: authLoading } = useContext(AuthContext);
  const theme = useTheme();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
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
      if (!authLoading) {
        loadProducts();
      }
    }, [token, authLoading])
  );

  if (loading || authLoading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.scene, { backgroundColor: theme.background }]}>
      <Animated.FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/products/add-product',
                  params: { id: item.id },
                })
              }
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
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
                >
                  <Package size={24} color={theme.textSecondary} />
                </View>
              )}
              <View style={styles.detailsContainer}>
                <Text
                  style={[styles.name, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text style={[styles.price, { color: theme.primary }]}>
                  Rs. {item.price}
                </Text>
                <View style={styles.stockContainer}>
                  <Text
                    style={[styles.stockLabel, { color: theme.textSecondary }]}
                  >
                    Stock:
                  </Text>
                  <Text
                    style={[
                      styles.stockValue,
                      { color: item.stock > 0 ? theme.text : '#EF4444' },
                    ]}
                  >
                    {item.stock}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package
              size={48}
              color={theme.textSecondary}
              style={{ marginBottom: 12 }}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No products found.
            </Text>
            <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
              Add your first product to get started!
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/products/add-product')}
        style={[styles.fab, { backgroundColor: theme.primary }]}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#fff" />
        <Text style={styles.fabText}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySubText: { fontSize: 14, marginTop: 4 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 16 },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: 70, height: 70, borderRadius: 12, marginRight: 16 },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  stockContainer: { flexDirection: 'row', alignItems: 'center' },
  stockLabel: { fontSize: 13, marginRight: 4 },
  stockValue: { fontSize: 13, fontWeight: '600' },
});
