// E:\Axivers\NearBuy Project\shop-owner\app\signup.tsx

import { AuthContext } from '@/context/AuthContext';
import api from '@/services/api';
import { Link, useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCategory, setShopCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useContext(AuthContext);

  // 🔹 Handle registration
  const handleSignup = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !shopName.trim() ||
      !shopAddress.trim() ||
      !shopCategory.trim()
    ) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }

    try {
      setLoading(true);

      // 📤 Send only this info; backend geocodes shop_address
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'SHOP_OWNER',
        shop_name: shopName,
        shop_address: shopAddress,
        shop_category: shopCategory,
        phone,
        image,
      });

      const { token, user } = res.data;
      await login(token, user);
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      Alert.alert(
        'Signup Failed',
        err.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Shop Owner Signup</Text>

      {/* Owner info */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
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

      {/* Shop info */}
      <Text style={styles.sectionTitle}>Your Shop Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Shop Name"
        value={shopName}
        onChangeText={setShopName}
      />

      <View style={{ position: 'relative' }}>
        <TextInput
          style={[styles.input, { paddingLeft: 38 }]}
          placeholder="Shop Address (e.g. 123 Main Street, City)"
          value={shopAddress}
          onChangeText={setShopAddress}
        />
        <MapPin
          size={20}
          color="#888"
          style={{ position: 'absolute', top: 14, left: 10 }}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Shop Category (e.g. Grocery, Electronics)"
        value={shopCategory}
        onChangeText={setShopCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone (optional)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Image URL (optional)"
        value={image}
        onChangeText={setImage}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating…' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      <Link href="/login" style={styles.link}>
        Already have an account? Login
      </Link>
    </ScrollView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
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
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 16,
  },
});
