// E:\Axivers\NearBuy Project\shop-owner\app\products\add-category.tsx

import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { Tag, Trash2 } from 'lucide-react-native';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,           
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ManageCategoriesScreen() {
  const { token } = useContext(AuthContext);
  const  theme  = useTheme();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Function to load categories from the API
  const loadCategories = async () => {
    try {
      !loading && setLoading(true); // Only set loading if not already loading
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

  // Reload categories whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  // Function to handle adding a new category
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
      await loadCategories(); // Refresh the list
    } catch (e) {
      Alert.alert('Error', 'Could not add the new category.');
    } finally {
      setIsAdding(false);
    }
  };

  // Function to confirm and handle deletion
  const confirmDelete = (id: number, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
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
              await loadCategories(); // Refresh the list
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
      {/* Input form for adding a new category */}
      <View
        style={[
          styles.addCategoryContainer,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TextInput
          style={[
            styles.categoryInput,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder="New category name..."
          placeholderTextColor={theme.textSecondary}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          onSubmitEditing={handleAddCategory}
        />
        <TouchableOpacity
          style={[
            styles.addCategoryBtn,
            { backgroundColor: theme.primary, opacity: isAdding ? 0.7 : 1 },
          ]}
          onPress={handleAddCategory}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.addCategoryBtnText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* List of existing categories */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
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
            <TouchableOpacity
              onPress={() => confirmDelete(item.id, item.name)}
              style={styles.deleteButton}
            >
              <Trash2 size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              You haven't added any categories yet.
            </Text>
          </View>
        }
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1 },
  addCategoryContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  categoryInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addCategoryBtn: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    minWidth: 70,
  },
  addCategoryBtnText: { color: '#fff', fontWeight: 'bold' },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  categoryName: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600' },
  deleteButton: { padding: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
});
