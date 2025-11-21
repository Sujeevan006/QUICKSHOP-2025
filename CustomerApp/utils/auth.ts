// // utils/auth.ts
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import type { UserProfile } from '@/types';

// const USERS_KEY = 'users_registry';

// export type LocalUserRecord = {
//   id: string;
//   email: string;
//   name: string;
//   password: string; // NOTE: plaintext for demo. Do NOT use in production.
//   avatar?: string;
//   provider?: 'email' | 'google' | 'apple';
// };

// export async function loadUsers(): Promise<LocalUserRecord[]> {
//   try {
//     const raw = await AsyncStorage.getItem(USERS_KEY);
//     if (!raw) return [];
//     const arr = JSON.parse(raw);
//     return Array.isArray(arr) ? arr : [];
//   } catch {
//     return [];
//   }
// }

// export async function saveUsers(list: LocalUserRecord[]) {
//   await AsyncStorage.setItem(USERS_KEY, JSON.stringify(list));
// }

// export function validateEmail(email: string) {
//   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return re.test(String(email).toLowerCase());
// }

// export function validatePassword(pw: string) {
//   const rules = {
//     length: pw.length >= 8,
//     lower: /[a-z]/.test(pw),
//     upper: /[A-Z]/.test(pw),
//     digit: /\d/.test(pw),
//     special: /[^A-Za-z0-9]/.test(pw),
//   };
//   const valid = Object.values(rules).every(Boolean);
//   return { valid, rules };
// }

// export async function signUpLocal(
//   name: string,
//   email: string,
//   password: string
// ): Promise<{ ok: true; user: UserProfile } | { ok: false; error: string }> {
//   const users = await loadUsers();
//   const exists = users.some(
//     (u) => u.email.toLowerCase() === email.toLowerCase()
//   );
//   if (exists) return { ok: false, error: 'Email already registered' };

//   const rec: LocalUserRecord = {
//     id: `local_${Date.now()}`,
//     name,
//     email,
//     password, // for demo only
//     provider: 'email',
//   };
//   await saveUsers([...users, rec]);

//   const user: UserProfile = {
//     id: rec.id,
//     name: rec.name,
//     email: rec.email,
//     avatar: rec.avatar,
//     accountType: 'customer',
//   };
//   return { ok: true, user };
// }

// export async function loginLocal(
//   email: string,
//   password: string
// ): Promise<{ ok: true; user: UserProfile } | { ok: false; error: string }> {
//   const users = await loadUsers();
//   const rec = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
//   if (!rec) return { ok: false, error: 'Account not found' };
//   if (rec.password !== password)
//     return { ok: false, error: 'Invalid credentials' };

//   const user: UserProfile = {
//     id: rec.id,
//     name: rec.name,
//     email: rec.email,
//     avatar: rec.avatar,
//     accountType: 'customer',
//   };
//   return { ok: true, user };
// }

// export async function upsertSocialUser(
//   provider: 'google' | 'apple',
//   profile: { id: string; name?: string; email?: string; avatar?: string }
// ): Promise<UserProfile> {
//   const users = await loadUsers();
//   const idx = users.findIndex(
//     (u) => u.email?.toLowerCase() === (profile.email || '').toLowerCase()
//   );
//   let rec: LocalUserRecord;

//   if (idx >= 0) {
//     rec = {
//       ...users[idx],
//       name: profile.name || users[idx].name,
//       avatar: profile.avatar || users[idx].avatar,
//     };
//     users[idx] = rec;
//   } else {
//     rec = {
//       id: `${provider}_${profile.id}`,
//       name: profile.name || 'User',
//       email: profile.email || `${provider}_${profile.id}@example.com`,
//       password: '',
//       provider,
//       avatar: profile.avatar,
//     };
//     users.push(rec);
//   }
//   await saveUsers(users);

//   return {
//     id: rec.id,
//     name: rec.name,
//     email: rec.email,
//     avatar: rec.avatar,
//     accountType: 'customer',
//   };
// }
