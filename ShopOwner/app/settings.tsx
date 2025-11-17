// app/settings.tsx (Shop Owner App)
import { useApp } from '@/context/AppContext';
import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, LogOut, Moon, Sun, User } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
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

export default function SettingsScreen() {
  const { user, token, logout, login } = useContext(AuthContext);
  const { theme, mode, setColorScheme } = useTheme();
  const { settings, updateSettings } = useApp();
  const router = useRouter();

  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
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
      await login(token!, res.data.user); // update context with new data
      Alert.alert('Success', 'Profile updated');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow photo gallery access');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Profile */}
      <View
        style={{
          backgroundColor: theme.surface,
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>
          Profile
        </Text>

        <View
          style={{
            alignItems: 'center',
            marginTop: 16,
            marginBottom: 16,
          }}
        >
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
                backgroundColor: theme.border,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <User size={26} color={theme.textSecondary} />
            </View>
          )}

          <TouchableOpacity
            onPress={pickImage}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 6,
              borderWidth: 1,
              borderColor: theme.border,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Camera size={16} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, marginLeft: 6 }}>
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Email:</Text>
        <Text
          style={{
            color: theme.text,
            fontWeight: '600',
            marginBottom: 10,
          }}
        >
          {user?.email}
        </Text>

        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          Phone Number
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          placeholderTextColor={theme.textSecondary}
          style={{
            color: theme.text,
            paddingVertical: Platform.OS === 'ios' ? 10 : 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            marginBottom: 12,
          }}
        />

        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          Address
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Home address"
          placeholderTextColor={theme.textSecondary}
          style={{
            color: theme.text,
            paddingVertical: Platform.OS === 'ios' ? 10 : 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            marginBottom: 16,
          }}
        />

        <TouchableOpacity
          onPress={handleUpdate}
          style={{
            backgroundColor: theme.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appearance */}
      <View
        style={{
          backgroundColor: theme.surface,
          borderRadius: 10,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>
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
              <Sun size={20} color={theme.textSecondary} />
            ) : (
              <Moon size={20} color={theme.textSecondary} />
            )}
            <Text
              style={{
                marginLeft: 8,
                color: theme.text,
                fontWeight: '600',
              }}
            >
              {mode === 'light' ? 'Light' : 'Dark'} mode
            </Text>
          </View>

          <Switch
            value={mode === 'dark'}
            onValueChange={(val) => setColorScheme?.(val ? 'dark' : 'light')}
            thumbColor="#fff"
            trackColor={{
              false: theme.border,
              true: theme.primary,
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
