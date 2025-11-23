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
  Image as ImageIcon,
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
      allowsEditing: true,
      aspect: [1, 1],
      base64: true, // Get base64 as fallback
    });

    if (result.canceled) return;

    try {
      setUploading(true);
      const asset = result.assets[0];
      
      // Try to upload to backend first
      try {
        // Get file extension from URI or mimeType
        const uriParts = asset.uri.split('.');
        const fileExtension = uriParts[uriParts.length - 1];
        const fileName = asset.fileName || `product_${Date.now()}.${fileExtension}`;
        
        // Determine mime type
        let mimeType = asset.mimeType || 'image/jpeg';
        if (!mimeType && fileExtension) {
          const ext = fileExtension.toLowerCase();
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
        }

        const formData = new FormData();
        formData.append('image', {
          uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
          name: fileName,
          type: mimeType,
        } as any);

        console.log('Uploading image:', { fileName, mimeType, uri: asset.uri });

        const uploadRes = await api.post('/uploads', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Upload successful:', uploadRes.data);
        
        if (uploadRes.data && uploadRes.data.url) {
          setForm((prev) => ({ ...prev, product_image: uploadRes.data.url }));
          Alert.alert('Success', 'Image uploaded successfully!');
        } else {
          throw new Error('No URL returned from server');
        }
      } catch (uploadError: any) {
        // If upload fails, use base64 as fallback
        console.log('Upload endpoint not available, using base64 fallback');
        
        if (asset.base64) {
          const base64Image = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
          setForm((prev) => ({ ...prev, product_image: base64Image }));
          Alert.alert('Success', 'Image added successfully!');
        } else {
          // If no base64, just use the local URI (won't work on backend but allows testing)
          setForm((prev) => ({ ...prev, product_image: asset.uri }));
          Alert.alert('Note', 'Image added locally. Upload endpoint not configured on backend.');
        }
      }
    } catch (e: any) {
      console.error('Image selection error:', e?.message || e);
      Alert.alert('Error', 'Failed to process image. Please try again.');
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
      
      // Check if image is base64 and might be too large
      const isBase64Image = form.product_image?.startsWith('data:image');
      const imageSize = form.product_image ? form.product_image.length : 0;
      const isImageTooLarge = imageSize > 500000; // 500KB limit for base64
      
      // Prepare payload
      let payload: any = {
        name: form.name,
        price: parseFloat(form.price),
        unit_type: form.unit_type,
        stock: parseInt(form.stock || '0'),
        category: form.category,
        quantity: form.quantity ? parseFloat(form.quantity) : null,
      };

      // Only include image if it's not too large or if it's a URL
      if (form.product_image && (!isBase64Image || !isImageTooLarge)) {
        payload.product_image = form.product_image;
      } else if (isImageTooLarge) {
        console.warn('Image too large for database, saving without image');
      }

      console.log('Saving product:', { 
        ...payload, 
        product_image: payload.product_image ? (isBase64Image ? 'BASE64_IMAGE' : 'URL') : 'NONE',
        imageSize: imageSize > 0 ? `${Math.round(imageSize / 1024)}KB` : '0KB'
      });

      try {
        if (isEdit) {
          await api.put(`/products/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Alert.alert('Success', 'Product updated successfully!');
        } else {
          await api.post('/products', payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Alert.alert('Success', 'Product added successfully!');
        }
        router.back();
      } catch (saveError: any) {
        // If insert failed with image, try without image
        if (saveError?.response?.data?.message?.includes('Insert failed') && payload.product_image) {
          console.log('Insert failed with image, retrying without image...');
          
          Alert.alert(
            'Image Too Large',
            'The image is too large for the database. Save product without image?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Save Without Image',
                onPress: async () => {
                  try {
                    setSaving(true);
                    const payloadWithoutImage = { ...payload };
                    delete payloadWithoutImage.product_image;
                    
                    if (isEdit) {
                      await api.put(`/products/${id}`, payloadWithoutImage, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    } else {
                      await api.post('/products', payloadWithoutImage, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    }
                    Alert.alert('Success', 'Product saved without image!');
                    router.back();
                  } catch (retryError: any) {
                    console.error('Retry failed:', retryError?.response?.data || retryError?.message);
                    Alert.alert('Error', 'Failed to save product even without image.');
                  } finally {
                    setSaving(false);
                  }
                },
              },
            ]
          );
          return; // Exit early, waiting for user response
        }
        throw saveError; // Re-throw if it's a different error
      }
    } catch (e: any) {
      console.error('Product save error:', e?.response?.data || e?.message || e);
      
      let errorMessage = isEdit ? 'Failed to update product.' : 'Failed to add product.';
      
      if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
        
        // Add helpful context for common errors
        if (errorMessage.includes('Insert failed')) {
          errorMessage += '\n\nThis might be due to:\n• Image file too large\n• Database field size limits\n• Missing required fields';
        }
      } else if (e?.response?.status === 500) {
        errorMessage = 'Server error. The image might be too large for the database.';
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Error', errorMessage);
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
        style={[styles.modalContainer, { maxHeight: '92%' }]}
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Image Upload Section */}
              <View style={styles.imageSection}>
                {form.product_image ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: form.product_image }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={[styles.changeImageBtn, { backgroundColor: colors.surface }]}
                      onPress={pickImage}
                      disabled={uploading}
                    >
                      <Camera size={16} color={colors.text} />
                      <Text style={[styles.changeImageText, { color: colors.text }]}>
                        {uploading ? 'Uploading...' : 'Change'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.imagePlaceholder,
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
                      <>
                        <ImageIcon size={40} color={colors.textSecondary} />
                        <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                          Tap to upload image
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Product Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Product Name *
                </Text>
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
                    placeholder="Enter product name"
                    placeholderTextColor={colors.textSecondary}
                    value={form.name}
                    onChangeText={(t) => setForm({ ...form, name: t })}
                  />
                </View>
              </View>

              {/* Unit Type & Quantity Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Unit Type *
                  </Text>
                  <View
                    style={[
                      styles.pickerWrapper,
                      {
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
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Quantity
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="e.g. 250"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      value={form.quantity}
                      onChangeText={(t) => setForm({ ...form, quantity: t })}
                    />
                  </View>
                </View>
              </View>

              {/* Price */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Price *
                </Text>
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
                    placeholder="Enter price"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                    value={form.price}
                    onChangeText={(t) => setForm({ ...form, price: t })}
                  />
                </View>
              </View>

              {/* Stock */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Stock Quantity
                </Text>
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
                    placeholder="Available stock"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={form.stock}
                    onChangeText={(t) => setForm({ ...form, stock: t })}
                  />
                </View>
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Category *
                </Text>
                <View
                  style={[
                    styles.pickerWrapper,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
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
                activeOpacity={0.8}
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
                  activeOpacity={0.8}
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  changeImageBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtn: {
    flex: 1,
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 18,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 16,
  },
});
