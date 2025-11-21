// app/settings.tsx

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, LogOut, Moon, Sun, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';

// useAuth module wasn't available in this project; using the local stub below
import api from '@/services/api';

export default function SettingsScreen() {
  const { user, token, logout, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const mode = (theme as any)?.mode ?? 'light';

  // theme may be typed as string in your context; cast it to any locally to access rich theme keys
  const themeObj = theme as any;
  const themeTyped = theme as any;

  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!token) {
      Alert.alert('Error', 'Session expired. Please log in again.');
      return;
    }
    try {
      setLoading(true);
      const res = await api.put(
        '/auth/update-profile',
        { avatar, address, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = res.data?.user;
      if (updatedUser) {
        // Replace login() with something like refreshUser()
        await login(token, updatedUser); // Make sure this matches context API
        Alert.alert('Success', 'Profile updated');
      }
    } catch (error) {
      console.error('Update failed', error);
      Alert.alert('Error', 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow gallery access first');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeTyped.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <View
        style={{
          backgroundColor: themeTyped.surface,
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: themeTyped.border,
        }}
      >
        <Text
          style={{ color: themeTyped.text, fontSize: 18, fontWeight: '700' }}
        >
          Profile
        </Text>

        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginBottom: 10,
              }}
            />
          ) : (
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: themeObj.border,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <User size={26} color={themeObj.textSecondary} />
            </View>
          )}

          <TouchableOpacity
            onPress={pickImage}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 6,
              borderWidth: 1,
              borderColor: themeTyped.border,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Camera size={16} color={themeObj.textSecondary} />
            <Text style={{ color: themeObj.textSecondary, marginLeft: 6 }}>
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{ color: themeObj.textSecondary, fontSize: 12, marginTop: 8 }}
        >
          Email
        </Text>
        <Text
          style={{
            color: themeTyped.text,
            fontWeight: '600',
            marginBottom: 10,
          }}
        >
          {user?.email}
        </Text>

        <Text style={{ color: themeObj.textSecondary, fontSize: 12 }}>
          Phone Number
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          placeholderTextColor={themeObj.textSecondary}
          style={{
            color: themeTyped.text,
            paddingVertical: Platform.OS === 'ios' ? 10 : 8,
            borderBottomWidth: 1,
            borderBottomColor: themeTyped.border,
            marginBottom: 12,
          }}
          keyboardType="phone-pad"
        />

        <Text style={{ color: themeObj.textSecondary, fontSize: 12 }}>
          Address
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
          placeholderTextColor={themeObj.textSecondary}
          style={{
            color: themeTyped.text,
            paddingVertical: Platform.OS === 'ios' ? 10 : 8,
            borderBottomWidth: 1,
            borderBottomColor: themeTyped.border,
            marginBottom: 16,
          }}
          multiline
        />

        <TouchableOpacity
          onPress={handleUpdate}
          disabled={loading}
          style={{
            backgroundColor: themeTyped.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: themeTyped.surface,
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: themeTyped.border,
        }}
      >
        <Text
          style={{ color: themeTyped.text, fontSize: 18, fontWeight: '700' }}
        >
          Appearance
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {mode === 'light' ? (
              <Sun size={20} color={themeObj.textSecondary} />
            ) : (
              <Moon size={20} color={themeObj.textSecondary} />
            )}
            <Text
              style={{
                marginLeft: 8,
                color: themeTyped.text,
                fontWeight: '600',
              }}
            >
              {mode === 'light' ? 'Light' : 'Dark'} mode
            </Text>
          </View>

          <Switch
            value={mode === 'dark'}
            onValueChange={() => toggleTheme?.()}
            thumbColor="#fff"
            trackColor={{
              false: themeTyped.border,
              true: themeTyped.primary,
            }}
          />
        </View>
      </View>

      {/* Logout */}
      <View style={{ marginTop: 32 }}>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ef4444',
            borderRadius: 8,
            paddingVertical: 12,
            backgroundColor: '#ef444420',
          }}
        >
          <LogOut size={18} color="#ef4444" />
          <Text
            style={{
              color: '#ef4444',
              fontWeight: '700',
              marginLeft: 8,
              fontSize: 16,
            }}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
function useAuth(): { user: any; token: any; logout: any; login: any } {
  // Minimal local auth hook implementation used only to satisfy this screen.
  // Replace with your project's real auth context/provider when available.
  const [userState, setUserState] = useState<any>(null);
  const [tokenState, setTokenState] = useState<any>(null);

  const login = async (token: any, user: any) => {
    setTokenState(token);
    setUserState(user);
  };

  const logout = async () => {
    setTokenState(null);
    setUserState(null);
  };

  return { user: userState, token: tokenState, logout, login };
}
