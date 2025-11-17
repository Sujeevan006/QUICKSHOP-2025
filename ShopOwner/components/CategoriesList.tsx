import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import { PlusCircle, Tag } from 'lucide-react-native';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CategoriesList() {
  const { token } = useContext(AuthContext);
  const  theme  = useTheme();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
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
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/products/manage-category',
                params: { id: item.id, name: item.name },
              })
            }
          >
            <View
              style={[
                styles.categoryItem,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Tag size={18} color={theme.textSecondary} />
              <Text style={[styles.categoryName, { color: theme.text }]}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No categories found. Tap below to add one!
          </Text>
        }
        contentContainerStyle={{ padding: 16 }}
      />
      <TouchableOpacity
        onPress={() => router.push('/products/manage-category')}
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <PlusCircle size={22} color="#fff" />
        <Text style={styles.fabText}>Add Category</Text>
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  categoryName: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '600' },
});
