// E:\Axivers\QUICKSHOP-2025\ShopOwner\app\products\add-product.tsx

import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { Picker } from '@react-native-picker/picker';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Box,
  Camera,
  DollarSign,
  Save,
  Tag,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const defaultFormState = {
  name: '',
  price: '',
  unit_type: 'kg',
  quantity: '',
  stock: '',
  category: '',
  product_image: '',
};

export default function AddEditProductModal() {
  const { token } = useContext(AuthContext);
  const { colors, themeName } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState(defaultFormState);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const unitOptions = ['kg', 'g', 'l', 'ml', 'piece', 'pack', 'dozen'];

  useEffect(() => {
    const initialize = async () => {
      try {
        const catRes = await api.get('/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedCategories = catRes.data || [];
        setCategories(fetchedCategories);

        if (isEdit) {
          const prodRes = await api.get(`/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const p = prodRes.data;
          setForm({
            name: p.name || '',
            price: String(p.price ?? ''),
            unit_type: p.unit_type || 'kg',
            quantity: String(p.quantity ?? ''),
            stock: String(p.stock ?? ''),
            category:
              p.category ||
              (fetchedCategories.length > 0 ? fetchedCategories[0].name : ''),
            product_image: p.product_image || '',
          });
        } else {
          const defaultCategory =
            fetchedCategories.length > 0 ? fetchedCategories[0].name : '';
          setForm({ ...defaultFormState, category: defaultCategory });
        }
      } catch (e) {
        console.error('Initialization error:', e);
        Alert.alert('Error', 'Could not load required data for the form.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [id]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo permission.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      setUploading(true);
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        name: asset.fileName || `product_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      } as any);

      const uploadRes = await api.post('/uploads', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setForm((prev) => ({ ...prev, product_image: uploadRes.data.url }));
    } catch (e: any) {
      console.error('Upload error:', e?.response?.data || e?.message);
      Alert.alert('Upload failed', 'Could not upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.unit_type || !form.category) {
      Alert.alert(
        'Validation Error',
        'Product Name, Price, Unit, and Category are required.'
      );
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        unit_type: form.unit_type,
        stock: parseInt(form.stock || '0'),
        category: form.category,
        product_image: form.product_image || null,
        quantity: form.quantity ? parseFloat(form.quantity) : null,
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/products', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      router.back();
    } catch (e) {
      console.error('Product save error:', e);
      Alert.alert(
        'Error',
        isEdit ? 'Failed to update product.' : 'Failed to add product.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${form.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              router.back();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete product.');
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
        style={[styles.modalContainer, { maxHeight: '90%' }]}
        onStartShouldSetResponder={() => true}
      >
        <BlurView
          intensity={50}
          tint={themeName}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEdit ? 'Edit Product' : 'Add Product'}
          </Text>
          <TouchableOpacity onPress={router.back} style={styles.closeButton}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.imageContainer}>
                {form.product_image ? (
                  <Image
                    source={{ uri: form.product_image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.imagePlaceholder,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Camera color={colors.textSecondary} size={32} />
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.imageButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={pickImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text
                      style={[styles.imageButtonText, { color: colors.text }]}
                    >
                      {form.product_image ? 'Change Photo' : 'Upload Photo'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Tag
                  color={colors.textSecondary}
                  size={18}
                  style={styles.icon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Product Name"
                  placeholderTextColor={colors.textSecondary}
                  value={form.name}
                  onChangeText={(t) => setForm({ ...form, name: t })}
                />
              </View>

              <View style={styles.row}>
                <View
                  style={[
                    styles.selectBox,
                    {
                      flex: 1,
                      marginRight: 8,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={form.unit_type}
                    onValueChange={(v) => setForm({ ...form, unit_type: v })}
                    style={{ color: colors.text }}
                    dropdownIconColor={colors.text}
                  >
                    {unitOptions.map((opt) => (
                      <Picker.Item label={opt} value={opt} key={opt} />
                    ))}
                  </Picker>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      flex: 1,
                      marginBottom: 0,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Qty (e.g. 250)"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={form.quantity}
                    onChangeText={(t) => setForm({ ...form, quantity: t })}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <DollarSign
                  color={colors.textSecondary}
                  size={18}
                  style={styles.icon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Price"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={form.price}
                  onChangeText={(t) => setForm({ ...form, price: t })}
                />
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Box
                  color={colors.textSecondary}
                  size={18}
                  style={styles.icon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Stock Quantity"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={form.stock}
                  onChangeText={(t) => setForm({ ...form, stock: t })}
                />
              </View>

              <View
                style={[
                  styles.selectBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    marginBottom: 12,
                  },
                ]}
              >
                <Picker
                  selectedValue={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                  style={{ color: colors.text }}
                  dropdownIconColor={colors.text}
                  enabled={categories.length > 0}
                >
                  {categories.length > 0 ? (
                    categories.map((opt) => (
                      <Picker.Item
                        label={opt.name}
                        value={opt.name}
                        key={opt.id}
                      />
                    ))
                  ) : (
                    <Picker.Item
                      label="No categories available"
                      value=""
                      enabled={false}
                    />
                  )}
                </Picker>
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.saveBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: saving ? 0.7 : 1,
                  },
                ]}
                onPress={handleSubmit}
                disabled={saving || uploading}
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
          </>
        )}
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
  scrollContent: { padding: 20 },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  image: { width: 120, height: 120, borderRadius: 10, marginBottom: 10 },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  imageButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  imageButtonText: { fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectBox: { borderWidth: 1, borderRadius: 8, justifyContent: 'center' },
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
