// E:\Axivers\NearBuy Project\shop-owner\app\login.tsx

import { AuthContext } from '@/context/AuthContext';
import api from '@/services/api';
import { Link, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please fill in both fields.');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      if (user.role !== 'SHOP_OWNER') {
        Alert.alert('Unauthorized', 'Only shop owners can use this app.');
        setLoading(false);
        return;
      }

      await login(token, user);
      router.replace('/dashboard');
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Login Failed',
        err.response?.data?.message || 'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop Owner Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={[styles.button, loading && { opacity: 0.6 }]}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <Link href="/signup" style={styles.link}>
        Don’t have an account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 16 },
});
