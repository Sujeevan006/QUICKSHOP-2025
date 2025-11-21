import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Save, Tag, Trash2, X } from 'lucide-react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ManageCategoryModal() {
  const { token } = useContext(AuthContext);
  // UPDATED: Destructure colors and themeName
  const { colors, themeName } = useTheme();
  const router = useRouter();
  const { id, name: initialName } = useLocalSearchParams<{
    id?: string;
    name?: string;
  }>();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setName(initialName || '');
    } else {
      setName('');
    }
  }, [id, initialName]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Category name cannot be empty.');
      return;
    }
    try {
      setSaving(true);
      const payload = { name: name.trim() };
      if (isEdit) {
        await api.put(`/categories/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/categories', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      router.back();
    } catch (e) {
      Alert.alert(
        'Error',
        isEdit ? 'Failed to update category.' : 'Failed to add category.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
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
              router.back();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete category.');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalOverlay}
    >
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={router.back} />

      <View
        style={styles.modalContainer}
        onStartShouldSetResponder={() => true}
      >
        {/* UPDATED: Use themeName directly */}
        <BlurView
          intensity={50}
          tint={themeName}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEdit ? 'Edit Category' : 'Add Category'}
          </Text>
          <TouchableOpacity onPress={router.back} style={styles.closeButton}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Tag color={colors.textSecondary} size={20} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Category Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.saveBtn,
              { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 },
            ]}
            onPress={handleSubmit}
            disabled={saving}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.btnText}>
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </Text>
          </TouchableOpacity>
          {isEdit && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={handleDelete}
              disabled={saving}
            >
              <Trash2 size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  closeButton: { padding: 4 },
  contentContainer: { padding: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtn: { flex: 1, marginRight: 10 },
  deleteBtn: { backgroundColor: '#FF3B30', paddingHorizontal: 16 },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
});
