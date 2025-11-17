// E:\Axivers\NearBuy Project\shop-backend\controllers\authController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// 🔑 helper to generate tokens
const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

// 🧱 REGISTER
export const register = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    shop_name,
    shop_address,
    shop_category,
  } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Missing required fields.' });

  const conn = await pool.getConnection();
  try {
    // existing user check
    const [exists] = await conn.query('SELECT id FROM users WHERE email=?', [
      email,
    ]);
    if (exists.length > 0)
      return res.status(400).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hashed, role || 'CUSTOMER']
    );
    const userId = result.insertId;
    let shop = null;

    if (role === 'SHOP_OWNER') {
      // ---- Geocode shop address ----
      let latitude = null;
      let longitude = null;

      if (shop_address) {
        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            shop_address
          )}&key=${process.env.GOOGLE_GEOCODE_KEY}`;
          const geo = await axios.get(url);
          if (geo.data.status === 'OK' && geo.data.results[0]) {
            latitude = geo.data.results[0].geometry.location.lat;
            longitude = geo.data.results[0].geometry.location.lng;
          }
        } catch (err) {
          console.error('Geocoding error:', err.message);
        }
      }

      const [sres] = await conn.query(
        `INSERT INTO shops
           (owner_id, shop_name, shop_address, shop_category, latitude, longitude, phone, image)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          userId,
          shop_name,
          shop_address,
          shop_category,
          latitude,
          longitude,
          req.body.phone ?? null,
          req.body.image ?? null,
        ]
      );

      const [[shopData]] = await conn.query('SELECT * FROM shops WHERE id=?', [
        sres.insertId,
      ]);
      shop = shopData;
    }

    const [[user]] = await conn.query(
      'SELECT id, name, email, role FROM users WHERE id=?',
      [userId]
    );
    const token = createToken(user);
    res.json({ token, user: { ...user, shop } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    conn.release();
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Missing email or password.' });

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM users WHERE email=?', [
      email,
    ]);
    if (rows.length === 0)
      return res.status(400).json({ message: 'Invalid credentials.' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: 'Invalid credentials.' });

    let shop = null;
    if (user.role === 'SHOP_OWNER') {
      const [s] = await conn.query('SELECT * FROM shops WHERE owner_id=?', [
        user.id,
      ]);
      shop = s[0] || null;
    }

    const token = createToken(user);
    delete user.password;
    res.json({ token, user: { ...user, shop } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    conn.release();
  }
};

// 🧍 UPDATE PROFILE
export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { phone, address, avatar } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'UPDATE users SET phone=?, address=?, avatar=? WHERE id=?',
      [phone, address, avatar, userId]
    );
    const [[updated]] = await conn.query(
      'SELECT id, name, email, role, phone, address, avatar FROM users WHERE id=?',
      [userId]
    );
    res.json({ user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed.' });
  } finally {
    conn.release();
  }
};
