import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { BlurView } from 'expo-blur';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, FileText, Save, Tag, Trash2, X } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
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

  useFocusEffect(
    React.useCallback(() => {
      if (isEdit) {
        console.log('Editing offer with ID:', id);
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
        // Reset form for new offer
        setTitle('');
        setDescription('');
        setBannerUrl('');
        setLoadingInitial(false);
      }
    }, [id, isEdit, token])
  );

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

      // Resize and compress image
      const manipulated = await manipulateAsync(
        asset.uri,
        [{ resize: { width: 1080 } }], // Resize to max width 1080px
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      const formData = new FormData();
      formData.append('image', {
        uri: manipulated.uri,
        name: `banner_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      // Use fetch instead of axios for reliable file uploads in React Native
      const uploadResponse = await fetch(`${api.defaults.baseURL}/uploads`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          // Explicitly do NOT set Content-Type, let fetch handle it
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
      }

      const responseData = await uploadResponse.json();
      console.log('Upload successful:', responseData);
      setBannerUrl(responseData.url);
    } catch (e: any) {
      console.error('Upload error:', e.message);
      Alert.alert('Upload failed', `Could not upload image. ${e.message}`);
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
    <View style={styles.container}>
      {/* Blur the background content (the list behind the modal) */}
      <BlurView
        intensity={20}
        tint={themeName === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={router.back}
          activeOpacity={1}
        />

        <View
          style={[
            styles.modalContainer,
            {
              maxHeight: '85%',
              backgroundColor:
                themeName === 'dark'
                  ? 'rgba(30,30,30,0.85)'
                  : 'rgba(255,255,255,0.85)',
              borderColor: colors.border,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Inner blur for the glass card effect */}
          <BlurView
            intensity={40}
            tint={themeName}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isEdit ? 'Edit Offer' : 'New Offer'}
            </Text>
            <TouchableOpacity
              onPress={router.back}
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {loadingInitial ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.imageContainer}>
                  {bannerUrl ? (
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: bannerUrl }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={[
                          styles.editImageBtn,
                          { backgroundColor: colors.surface },
                        ]}
                        onPress={pickAndUploadImage}
                        disabled={uploading}
                      >
                        <Camera size={16} color={colors.text} />
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
                      onPress={pickAndUploadImage}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <>
                          <Camera color={colors.textSecondary} size={40} />
                          <Text
                            style={[
                              styles.uploadText,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Upload Banner Image
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Offer Title
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
                      placeholder="e.g. Summer Sale 50% Off"
                      placeholderTextColor={colors.textSecondary}
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Description
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        alignItems: 'flex-start',
                        paddingVertical: 12,
                      },
                    ]}
                  >
                    <FileText
                      color={colors.textSecondary}
                      size={18}
                      style={[styles.icon, { marginTop: 4 }]}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          height: 80,
                          textAlignVertical: 'top',
                          color: colors.text,
                        },
                      ]}
                      placeholder="Add details about this offer..."
                      placeholderTextColor={colors.textSecondary}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                    />
                  </View>
                </View>
              </ScrollView>

              <View
                style={[
                  styles.footer,
                  {
                    borderTopColor: colors.border,
                    backgroundColor: 'transparent',
                  },
                ]}
              >
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
                  <Save size={18} color="#fff" />
                  <Text style={styles.btnText}>
                    {saving
                      ? 'Saving...'
                      : isEdit
                      ? 'Update Offer'
                      : 'Create Offer'}
                  </Text>
                </TouchableOpacity>

                {isEdit && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={handleDelete}
                    disabled={saving}
                  >
                    <Trash2 size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Lighter overlay since we have blur
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  scrollContent: { padding: 20 },
  imageContainer: { alignItems: 'center', marginBottom: 24 },
  imageWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  editImageBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    padding: 8,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 12,
  },
  uploadText: { fontSize: 14, fontWeight: '600' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  icon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16 },
  footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveBtn: { flex: 1 },
  deleteBtn: { backgroundColor: '#FF3B30', paddingHorizontal: 20 },
  btnText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 16 },
});
