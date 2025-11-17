// app/auth/signup.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const [role, setRole] = useState<'CUSTOMER' | 'SHOP_OWNER'>('CUSTOMER');

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Shop-owner extra fields
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCategory, setShopCategory] = useState('');

  const { signup } = useContext(AuthContext);
  const router = useRouter();

  const handleSignup = async () => {
    try {
      if (role === 'CUSTOMER') {
        if (!name || !email || !password) {
          Alert.alert('Error', 'Please fill all required fields');
          return;
        }
        await signup(name, email, password, role);
      } else if (role === 'SHOP_OWNER') {
        if (!shopName || !shopAddress || !shopCategory || !email || !password) {
          Alert.alert('Error', 'Please fill all shop details');
          return;
        }
        await signup(
          name || shopName, // allow empty "personal name"
          email,
          password,
          role,
          shopName,
          shopAddress,
          shopCategory
        );
      }

      Alert.alert('Success', 'Account created!');
      router.replace('/'); // redirect to home after signup
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Signup failed');
      console.error('Signup Error:', err.response?.data || err.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Account</Text>

      {/* Role Selector */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'CUSTOMER' && styles.selected]}
          onPress={() => setRole('CUSTOMER')}
        >
          <Text
            style={[
              styles.roleText,
              role === 'CUSTOMER' && styles.selectedText,
            ]}
          >
            Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBtn, role === 'SHOP_OWNER' && styles.selected]}
          onPress={() => setRole('SHOP_OWNER')}
        >
          <Text
            style={[
              styles.roleText,
              role === 'SHOP_OWNER' && styles.selectedText,
            ]}
          >
            Shop Owner
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer fields */}
      {role === 'CUSTOMER' && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
      )}

      {/* Shop Owner fields */}
      {role === 'SHOP_OWNER' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Shop Name"
            value={shopName}
            onChangeText={setShopName}
          />
          <TextInput
            style={styles.input}
            placeholder="Shop Address"
            value={shopAddress}
            onChangeText={setShopAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Shop Category"
            value={shopCategory}
            onChangeText={setShopCategory}
          />
        </>
      )}

      {/* Common Fields */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
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

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { color: '#007BFF', textAlign: 'center', marginTop: 18 },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbb',
    marginHorizontal: 8,
    backgroundColor: '#fff',
  },
  selected: { backgroundColor: '#007BFF20', borderColor: '#007BFF' },
  roleText: { fontWeight: '700', fontSize: 15, color: '#333' },
  selectedText: { color: '#007BFF' },
});
