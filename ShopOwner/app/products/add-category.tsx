import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { FolderOpen, Plus, Tag, Trash2 } from 'lucide-react-native';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ManageCategoriesScreen() {
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadCategories = async () => {
    try {
      !loading && setLoading(true);
      const res = await api.get('/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (e) {
      console.error('Failed to load categories:', e);
      Alert.alert('Error', 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Validation', 'Category name cannot be empty.');
      return;
    }
    try {
      setIsAdding(true);
      await api.post(
        '/categories',
        { name: newCategoryName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCategoryName('');
      Keyboard.dismiss();
      await loadCategories();
    } catch (e) {
      Alert.alert('Error', 'Could not add the new category.');
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDelete = (id: number, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              await loadCategories();
            } catch (e) {
              Alert.alert('Error', 'Could not delete the category.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.scene,
          { backgroundColor: theme.background, justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.scene, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.addCategoryContainer,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Add New Category
          </Text>
          <View style={styles.inputRow}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Tag size={18} color={theme.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.categoryInput, { color: theme.text }]}
                placeholder="Enter category name..."
                placeholderTextColor={theme.textSecondary}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                onSubmitEditing={handleAddCategory}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.addCategoryBtn,
                { backgroundColor: theme.primary, opacity: isAdding ? 0.7 : 1 },
              ]}
              onPress={handleAddCategory}
              disabled={isAdding}
              activeOpacity={0.8}
            >
              {isAdding ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Plus size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Animated.FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
            <View
              style={[
                styles.categoryItem,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: theme.background }]}>
                <FolderOpen size={20} color={theme.primary} />
              </View>
              <Text style={[styles.categoryName, { color: theme.text }]}>
                {item.name}
              </Text>
              <TouchableOpacity
                onPress={() => confirmDelete(item.id, item.name)}
                style={styles.deleteButton}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FolderOpen size={48} color={theme.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No categories yet
            </Text>
            <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
              Add your first category above
            </Text>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1 },
  addCategoryContainer: {
    padding: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  categoryInput: {
    flex: 1,
    fontSize: 16,
  },
  addCategoryBtn: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
  },
});
