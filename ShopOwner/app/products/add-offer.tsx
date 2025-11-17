import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, FileText, Save, Tag, Trash2, X } from 'lucide-react-native';
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

const defaultState = {
  title: '',
  description: '',
  bannerUrl: '',
};

export default function AddEditOfferModal() {
  const { token } = useContext(AuthContext);
  const { colors, themeName } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchOffer = async () => {
        try {
          const res = await api.get(`/offers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTitle(res.data.title);
          setDescription(res.data.description || '');
          setBannerUrl(res.data.banner_image_url);
        } catch (error) {
          Alert.alert('Error', 'Failed to load offer data for editing.');
          router.back();
        } finally {
          setLoadingInitial(false);
        }
      };
      fetchOffer();
    } else {
      setTitle(defaultState.title);
      setDescription(defaultState.description);
      setBannerUrl(defaultState.bannerUrl);
    }
  }, [id]);

  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo permission.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (result.canceled) return;

    try {
      setUploading(true);
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        name: asset.fileName || `banner_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      } as any);

      const res = await api.post('/uploads', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setBannerUrl(res.data.url);
    } catch (e) {
      console.error('Upload error:', e);
      Alert.alert('Upload failed', 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !bannerUrl) {
      Alert.alert('Validation Error', 'Title and a banner image are required.');
      return;
    }
    try {
      setSaving(true);
      const payload = { title, description, banner_image_url: bannerUrl };
      if (isEdit) {
        await api.put(`/offers/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/offers', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      router.back();
    } catch (e) {
      console.error('Save offer error:', e);
      Alert.alert(
        'Error',
        isEdit ? 'Failed to update offer.' : 'Failed to create offer.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Offer', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/offers/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            router.back();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete offer.');
          }
        },
      },
    ]);
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
            {isEdit ? 'Edit Offer' : 'Create Offer'}
          </Text>
          <TouchableOpacity onPress={router.back} style={styles.closeButton}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {loadingInitial ? (
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
                {bannerUrl ? (
                  <Image
                    source={{ uri: bannerUrl }}
                    style={styles.imagePreview}
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
                    <Camera color={colors.textSecondary} size={48} />
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
                  onPress={pickAndUploadImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text
                      style={[styles.imageButtonText, { color: colors.text }]}
                    >
                      {bannerUrl ? 'Change Banner' : 'Upload Banner'}
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
                  size={20}
                  style={styles.icon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Offer Title"
                  placeholderTextColor={colors.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    alignItems: 'flex-start',
                  },
                ]}
              >
                <FileText
                  color={colors.textSecondary}
                  size={20}
                  style={[styles.icon, { marginTop: 14 }]}
                />
                <TextInput
                  style={[
                    styles.input,
                    { height: 100, textAlignVertical: 'top' },
                  ]}
                  placeholder="Description (optional)"
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
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
                  {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
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
  imageContainer: { alignItems: 'center', marginBottom: 24 },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  imageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  imageButtonText: { fontWeight: '600', fontSize: 15 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
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
0