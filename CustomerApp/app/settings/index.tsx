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
} from 'react-native';
import { X as CloseIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '@/contexts/AuthContext';
import {
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
  WifiOff,
  Info,
} from 'lucide-react-native';

type ThemeMode = 'light' | 'dark';
type Language = 'en' | 'si' | 'ta';

export default function SettingsScreen() {
  // NOTE: grab mode + setColorScheme so we can switch ThemeProvider directly
  const { theme, mode, setColorScheme } = useTheme();
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const { user, setUser, token, logout } = React.useContext(AuthContext);

  // Profile edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [formAvatar, setFormAvatar] = useState<string | undefined>(
    user?.avatar
  );
  const [formName, setFormName] = useState(user?.name || '');
  const [formMobile, setFormMobile] = useState((user as any)?.mobile || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [formAddress, setFormAddress] = useState((user as any)?.address || '');

  useEffect(() => {
    // Refresh form when user changes
    setFormAvatar(user?.avatar);
    setFormName(user?.name || '');
    setFormMobile((user as any)?.mobile || '');
    setFormPhone(user?.phone || '');
    setFormAddress((user as any)?.address || '');
  }, [user?.id]);

  // Switch ThemeProvider immediately + persist in App settings
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
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        quality: 0.85,
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
      const res = await axios.put(
        'http://192.168.90.200:5000/api/auth/profile',
        {
          name: formName.trim() || user.name,
          phone: formPhone.trim(),
          address: formAddress.trim(),
          avatar: formAvatar,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data.user); // update state
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));

      setEditOpen(false);
      Alert.alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Profile update error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Update failed');
    }
  };

  const onLogout = async () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout(); // 👈 clear AuthContext + AsyncStorage
          router.replace('/auth/login'); // 👈 go back to login
        },
      },
    ]);
  };

  // Small UI helpers
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text
      style={{
        color: theme.textSecondary,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: 16,
        marginBottom: 8,
        marginHorizontal: 16,
      }}
    >
      {children}
    </Text>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}
    >
      {children}
    </View>
  );

  const Row = ({
    icon,
    title,
    subtitle,
    right,
    onPress,
    noBorder,
  }: {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    noBorder?: boolean;
  }) => {
    const Comp: any = onPress ? TouchableOpacity : View;
    return (
      <Comp
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          borderBottomWidth: noBorder ? 0 : 1,
          borderBottomColor: theme.border,
        }}
      >
        {icon ? <View style={{ marginRight: 12 }}>{icon}</View> : null}
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </Comp>
    );
  };

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active?: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: active ? theme.primary : theme.border,
        backgroundColor: active ? `${theme.primary}20` : theme.surface,
        marginRight: 8,
        marginTop: 8,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={{
          color: active ? theme.primary : theme.text,
          fontWeight: '600',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Scrollable content including Logout at the end */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Profile */}
        <SectionTitle>Profile</SectionTitle>
        <Card>
          {/* Top row: avatar + edit icon right */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Avatar */}
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${theme.primary}1A`,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontWeight: '800',
                    fontSize: 22,
                  }}
                >
                  {initials}
                </Text>
              </View>
            )}

            {/* Edit button aligned to the right side */}
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setEditOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                }}
              >
                <Pencil size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Email under photo (read-only) */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Email
            </Text>
            <Text
              style={{ color: theme.text, fontWeight: '600', marginTop: 2 }}
            >
              {user?.email || 'not set'}
            </Text>
          </View>

          {/* Name */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Name
            </Text>
            <Text
              style={{ color: theme.text, fontWeight: '600', marginTop: 2 }}
            >
              {user?.name || 'Guest user'}
            </Text>
          </View>

          {/* User Type */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Account Type
            </Text>
            <Text
              style={{ color: theme.text, fontWeight: '600', marginTop: 2 }}
            >
              {user?.role === 'SHOP_OWNER'
                ? 'Shop Owner'
                : user?.role === 'CUSTOMER'
                ? 'Customer'
                : 'Guest'}
            </Text>
          </View>

          {/* Phone number */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Phone number
            </Text>
            <Text
              style={{ color: theme.text, fontWeight: '600', marginTop: 2 }}
            >
              {user?.phone || 'not set'}
            </Text>
          </View>

          {/* Home address */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Home address
            </Text>
            <Text
              style={{
                color: theme.text,
                fontWeight: '600',
                marginTop: 2,
                lineHeight: 20,
              }}
            >
              {(user as any)?.address || 'not set'}
            </Text>
          </View>
        </Card>

        {/* Appearance */}
        <SectionTitle>Appearance</SectionTitle>
        <Card>
          <Row
            icon={<Sun size={20} color={theme.textSecondary} />}
            title="Theme"
            subtitle="Switch between light and dark mode"
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setThemeMode('light')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    borderWidth: 1,
                    borderColor:
                      mode === 'light' ? theme.primary : theme.border,
                    backgroundColor:
                      mode === 'light' ? `${theme.primary}20` : theme.surface,
                  }}
                >
                  <Text
                    style={{
                      color:
                        mode === 'light' ? theme.primary : theme.textSecondary,
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    Light
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setThemeMode('dark')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    borderWidth: 1,
                    borderLeftWidth: 0,
                    borderColor: mode === 'dark' ? theme.primary : theme.border,
                    backgroundColor:
                      mode === 'dark' ? `${theme.primary}20` : theme.surface,
                  }}
                >
                  <Text
                    style={{
                      color:
                        mode === 'dark' ? theme.primary : theme.textSecondary,
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            }
            noBorder
          />
        </Card>

        {/* Notifications */}
        <SectionTitle>Notifications</SectionTitle>
        <Card>
          <Row
            icon={<Bell size={20} color={theme.textSecondary} />}
            title="App notifications"
            subtitle="Receive offers, price drops and reminders"
            right={
              <Switch
                value={!!settings.notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={'#fff'}
              />
            }
            noBorder
          />
        </Card>

        {/* Language */}
        <SectionTitle>Language</SectionTitle>
        <Card>
          <Row
            icon={<Globe size={20} color={theme.textSecondary} />}
            title="App language"
            subtitle="Choose your preferred language"
            noBorder
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingBottom: 12,
            }}
          >
            <Chip
              label="English"
              active={settings.language === 'en'}
              onPress={() => setLanguage('en')}
            />
            <Chip
              label="සිංහල"
              active={settings.language === 'si'}
              onPress={() => setLanguage('si')}
            />
            <Chip
              label="தமிழ்"
              active={settings.language === 'ta'}
              onPress={() => setLanguage('ta')}
            />
          </View>
        </Card>

        {/* Security */}
        <SectionTitle>Security</SectionTitle>
        <Card>
          <Row
            icon={<Shield size={20} color={theme.textSecondary} />}
            title="Biometric unlock"
            subtitle="Use device biometrics to open the app"
            right={
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={'#fff'}
              />
            }
          />
          <Row
            title="Change password"
            subtitle="Update your account password"
            onPress={() => {}}
            noBorder
          />
        </Card>

        {/* Data Saver */}
        <SectionTitle>Data saver</SectionTitle>
        <Card>
          <Row
            icon={<Wifi size={20} color={theme.textSecondary} />}
            title="Download on Wi‑Fi only"
            right={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={'#fff'}
              />
            }
          />
          <Row
            icon={<WifiOff size={20} color={theme.textSecondary} />}
            title="Reduce image quality"
            right={
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={'#fff'}
              />
            }
            noBorder
          />
        </Card>

        {/* About */}
        <SectionTitle>About</SectionTitle>
        <Card>
          <Row
            icon={<Info size={20} color={theme.textSecondary} />}
            title="About Near Buy"
            subtitle="Version 1.0.0"
            onPress={() => {}}
            noBorder
          />
        </Card>

        {/* Logout or Login button */}
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          {user ? (
            // ✅ If user is logged in → Show LOGOUT
            <TouchableOpacity
              onPress={onLogout}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#ef4444',
                backgroundColor: '#ef444420',
              }}
            >
              <LogOut size={18} color="#ef4444" />
              <Text
                style={{ color: '#ef4444', fontWeight: '800', marginLeft: 8 }}
              >
                Log out
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.replace('/auth/login')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#007BFF',
                backgroundColor: '#007BFF20',
              }}
            >
              <Text style={{ color: '#007BFF', fontWeight: '800' }}>
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
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setEditOpen(false)} />

          <View
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              paddingBottom: 12,
              maxHeight: '85%',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 8,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: '800', color: theme.text }}
              >
                Edit profile
              </Text>

              <TouchableOpacity
                onPress={() => setEditOpen(false)}
                accessibilityLabel="Close"
              >
                <CloseIcon size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 16,
              }}
            >
              {/* Avatar picker */}
              <View style={{ alignItems: 'center' }}>
                {formAvatar ? (
                  <Image
                    source={{ uri: formAvatar }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${theme.primary}1A`,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <UserIcon size={24} color={theme.primary} />
                  </View>
                )}
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    marginTop: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  }}
                >
                  <Camera size={16} color={theme.textSecondary} />
                  <Text
                    style={{
                      marginLeft: 6,
                      color: theme.textSecondary,
                      fontWeight: '600',
                      fontSize: 12,
                    }}
                  >
                    Change Photo
                  </Text>
                </TouchableOpacity>

                {/* Email read-only */}
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  {user?.email || 'no email'}
                </Text>
              </View>

              {/* Inputs */}
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  Name
                </Text>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Your name"
                  placeholderTextColor={theme.textSecondary}
                  style={{
                    color: theme.text,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: Platform.OS === 'ios' ? 10 : 12,
                    marginTop: 6,
                    marginBottom: 10,
                  }}
                />

                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  Phone number
                </Text>
                <TextInput
                  value={formPhone}
                  onChangeText={setFormPhone}
                  placeholder="Phone number"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                  style={{
                    color: theme.text,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: Platform.OS === 'ios' ? 10 : 12,
                    marginTop: 6,
                    marginBottom: 10,
                  }}
                />

                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  Home address
                </Text>
                <TextInput
                  value={formAddress}
                  onChangeText={setFormAddress}
                  placeholder="Home address"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  style={{
                    color: theme.text,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    marginTop: 6,
                    minHeight: 76,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              {/* Save */}
              <TouchableOpacity
                onPress={saveProfile}
                style={{
                  marginTop: 16,
                  backgroundColor: theme.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>
                  Save changes
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
