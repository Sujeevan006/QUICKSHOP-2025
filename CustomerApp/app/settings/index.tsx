// app/settings/index.tsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import {
  X as CloseIcon,
  User as UserIcon,
  Pencil,
  Camera,
  LogOut,
  Bell,
  Globe,
  Sun,
  Moon,
  Shield,
  Wifi,
  Info,
  ChevronRight,
  Smartphone,
  MapPin,
  Mail,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '@/contexts/AuthContext';

type ThemeMode = 'light' | 'dark';
type Language = 'en' | 'si' | 'ta';

export default function SettingsScreen() {
  const { theme, mode, setColorScheme } = useTheme();
  const isDark = mode === 'dark';
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const { user, setUser, token, logout } = React.useContext(AuthContext);

  // Profile edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [formAvatar, setFormAvatar] = useState<string | undefined>(user?.avatar);
  const [formName, setFormName] = useState(user?.name || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [formAddress, setFormAddress] = useState((user as any)?.address || '');

  useEffect(() => {
    setFormAvatar(user?.avatar);
    setFormName(user?.name || '');
    setFormPhone(user?.phone || '');
    setFormAddress((user as any)?.address || '');
  }, [user?.id]);

  const setThemeMode = (m: ThemeMode) => {
    setColorScheme?.(m);
    updateSettings({ theme: m });
  };

  const toggleNotifications = (val: boolean) =>
    updateSettings({ notifications: val });
  const setLanguage = (lang: Language) => updateSettings({ language: lang });

  const initials =
    user?.name
      ?.split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'GU';

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'We need access to your photos to change the profile picture.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setFormAvatar(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image pick error:', e);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      // Mock update if API fails or for demo
      const updatedUser = {
        ...user,
        name: formName.trim() || user.name,
        phone: formPhone.trim(),
        address: formAddress.trim(),
        avatar: formAvatar,
      };
      
      // Try API call
      try {
        const res = await axios.put(
          'http://192.168.90.200:5000/api/auth/profile',
          {
            name: formName.trim() || user.name,
            phone: formPhone.trim(),
            address: formAddress.trim(),
            avatar: formAvatar,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.user) {
           setUser(res.data.user);
           await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        } else {
           // Fallback if API doesn't return user object structure we expect
           setUser(updatedUser);
           await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (apiErr) {
         // If API fails (e.g. network), just update locally for demo purposes
         console.warn('API update failed, updating locally', apiErr);
         setUser(updatedUser);
         await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setEditOpen(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const onLogout = async () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  // --- UI Components ---

  const SectionHeader = ({ title }: { title: string }) => (
    <Text
      style={{
        color: theme.primary,
        fontSize: 14,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 8,
        marginHorizontal: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {title}
    </Text>
  );

  const SettingItem = ({
    icon,
    title,
    subtitle,
    right,
    onPress,
    isLast,
    destructive,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    isLast?: boolean;
    destructive?: boolean;
  }) => {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
      <Wrapper
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: theme.surface,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: isDark ? '#222' : '#f0f0f0',
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: destructive ? '#fee2e2' : isDark ? '#1f2937' : '#f3f4f6',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            size: 18,
            color: destructive ? '#ef4444' : theme.text,
          })}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: destructive ? '#ef4444' : theme.text,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
        {right || (onPress && !destructive && <ChevronRight size={18} color={theme.textSecondary} />)}
      </Wrapper>
    );
  };

  const SettingsGroup = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        marginHorizontal: 20,
        overflow: 'hidden',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0 : 0.05,
            shadowRadius: 8,
          },
          android: {
            elevation: isDark ? 0 : 2,
            borderWidth: isDark ? 1 : 0,
            borderColor: theme.border,
          },
        }),
        borderWidth: isDark ? 1 : 0,
        borderColor: theme.border,
      }}
    >
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Profile Header */}
        <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
          <View style={{ position: 'relative' }}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 4,
                  borderColor: theme.surface,
                }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: theme.surface,
                }}
              >
                <Text style={{ fontSize: 32, fontWeight: '700', color: '#fff' }}>
                  {initials}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setEditOpen(true)}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: theme.text,
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: theme.background,
              }}
            >
              <Pencil size={14} color={theme.background} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginTop: 12 }}>
            {user?.name || 'Guest User'}
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>
            {user?.email || 'Sign in to sync data'}
          </Text>
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <SettingsGroup>
          <SettingItem
            icon={mode === 'dark' ? <Moon /> : <Sun />}
            title="Theme"
            subtitle={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            right={
              <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#333' : '#f0f0f0', borderRadius: 8, padding: 2 }}>
                <TouchableOpacity
                  onPress={() => setThemeMode('light')}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: mode === 'light' ? theme.surface : 'transparent',
                    borderRadius: 6,
                    ...Platform.select({
                      ios: mode === 'light' ? { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 } : {},
                      android: mode === 'light' ? { elevation: 1 } : {},
                    }),
                  }}
                >
                  <Sun size={16} color={mode === 'light' ? theme.text : theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setThemeMode('dark')}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: mode === 'dark' ? '#555' : 'transparent',
                    borderRadius: 6,
                    ...Platform.select({
                      ios: mode === 'dark' ? { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 } : {},
                      android: mode === 'dark' ? { elevation: 1 } : {},
                    }),
                  }}
                >
                  <Moon size={16} color={mode === 'dark' ? '#fff' : theme.textSecondary} />
                </TouchableOpacity>
              </View>
            }
            isLast
          />
        </SettingsGroup>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <SettingsGroup>
          <SettingItem
            icon={<Bell />}
            title="Notifications"
            right={
              <Switch
                value={!!settings.notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={'#fff'}
              />
            }
          />
          <SettingItem
            icon={<Globe />}
            title="Language"
            subtitle={
              settings.language === 'si' ? 'Sinhala' : settings.language === 'ta' ? 'Tamil' : 'English'
            }
            isLast
            right={
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['en', 'si', 'ta'] as const).map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => setLanguage(lang)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: settings.language === lang ? theme.primary : 'transparent',
                      borderWidth: 1,
                      borderColor: settings.language === lang ? theme.primary : theme.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ 
                      fontSize: 10, 
                      fontWeight: '700', 
                      color: settings.language === lang ? '#fff' : theme.textSecondary,
                      textTransform: 'uppercase'
                    }}>
                      {lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
        </SettingsGroup>

        {/* Security */}
        <SectionHeader title="Security" />
        <SettingsGroup>
          <SettingItem
            icon={<Shield />}
            title="Biometric Unlock"
            right={
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={'#fff'}
              />
            }
          />
          <SettingItem
            icon={<Wifi />}
            title="Data Saver"
            subtitle="Download images on Wi-Fi only"
            isLast
            right={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={'#fff'}
              />
            }
          />
        </SettingsGroup>

        {/* About */}
        <SectionHeader title="About" />
        <SettingsGroup>
          <SettingItem
            icon={<Info />}
            title="Version"
            right={<Text style={{ color: theme.textSecondary, fontSize: 14 }}>1.0.0</Text>}
            isLast
          />
        </SettingsGroup>

        {/* Logout */}
        <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
          {user ? (
            <TouchableOpacity
              onPress={onLogout}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                backgroundColor: '#fee2e2',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#fecaca',
              }}
            >
              <LogOut size={20} color="#ef4444" />
              <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '700', color: '#ef4444' }}>
                Log Out
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.replace('/auth/login')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                backgroundColor: theme.primary,
                borderRadius: 16,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                Login / Sign Up
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEditOpen(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <Pressable style={{ flex: 1 }} onPress={() => setEditOpen(false)} />
            
            <View style={{ 
              backgroundColor: theme.surface, 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24,
              paddingBottom: 40,
              maxHeight: '90%'
            }}>
              {/* Modal Header */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: theme.border
              }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setEditOpen(false)} style={{ padding: 4 }}>
                  <CloseIcon size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Avatar Edit */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                    {formAvatar ? (
                      <Image
                        source={{ uri: formAvatar }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                      />
                    ) : (
                      <View style={{ 
                        width: 100, 
                        height: 100, 
                        borderRadius: 50, 
                        backgroundColor: theme.primary,
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <UserIcon size={40} color="#fff" />
                      </View>
                    )}
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.text,
                      padding: 8,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: theme.surface
                    }}>
                      <Camera size={16} color={theme.background} />
                    </View>
                  </TouchableOpacity>
                  <Text style={{ marginTop: 12, color: theme.primary, fontWeight: '600' }}>
                    Change Profile Photo
                  </Text>
                </View>

                {/* Form Fields */}
                <View style={{ gap: 16 }}>
                  <View>
                    <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 13, fontWeight: '600' }}>FULL NAME</Text>
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      borderWidth: 1, 
                      borderColor: theme.border, 
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      height: 50,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb'
                    }}>
                      <UserIcon size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
                      <TextInput
                        value={formName}
                        onChangeText={setFormName}
                        placeholder="Enter your name"
                        placeholderTextColor={theme.textSecondary}
                        style={{ flex: 1, color: theme.text, fontSize: 16 }}
                      />
                    </View>
                  </View>

                  <View>
                    <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 13, fontWeight: '600' }}>PHONE NUMBER</Text>
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      borderWidth: 1, 
                      borderColor: theme.border, 
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      height: 50,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb'
                    }}>
                      <Smartphone size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
                      <TextInput
                        value={formPhone}
                        onChangeText={setFormPhone}
                        placeholder="Enter phone number"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="phone-pad"
                        style={{ flex: 1, color: theme.text, fontSize: 16 }}
                      />
                    </View>
                  </View>

                  <View>
                    <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 13, fontWeight: '600' }}>ADDRESS</Text>
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'flex-start', 
                      borderWidth: 1, 
                      borderColor: theme.border, 
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      height: 80,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb'
                    }}>
                      <MapPin size={20} color={theme.textSecondary} style={{ marginRight: 10, marginTop: 2 }} />
                      <TextInput
                        value={formAddress}
                        onChangeText={setFormAddress}
                        placeholder="Enter your address"
                        placeholderTextColor={theme.textSecondary}
                        multiline
                        style={{ flex: 1, color: theme.text, fontSize: 16, height: '100%' }}
                      />
                    </View>
                  </View>
                  
                  <View>
                     <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 13, fontWeight: '600' }}>EMAIL (Read Only)</Text>
                     <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        borderWidth: 1, 
                        borderColor: theme.border, 
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        height: 50,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f3f4f6',
                        opacity: 0.7
                     }}>
                        <Mail size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
                        <Text style={{ color: theme.textSecondary, fontSize: 16 }}>{user?.email}</Text>
                     </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={saveProfile}
                  style={{
                    backgroundColor: theme.primary,
                    borderRadius: 14,
                    height: 56,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 32,
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
