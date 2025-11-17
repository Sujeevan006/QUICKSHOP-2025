// E:\Axivers\NearBuy Project\shop-backend\controllers\productController.js

import pool from '../config/db.js';

// 📦 Add new product (now persists product_image and quantity)
export const addProduct = async (req, res) => {
  const ownerId = req.user.id;
  const { name, price, unit_type, stock, category, product_image, quantity } =
    req.body;

  if (!name || !price || !unit_type) {
    return res
      .status(400)
      .json({ message: 'Missing required product fields.' });
  }

  const conn = await pool.getConnection();
  try {
    // Find this owner's shop
    const [shops] = await conn.query(
      'SELECT id FROM shops WHERE owner_id = ?',
      [ownerId]
    );
    if (shops.length === 0)
      return res.status(400).json({ message: 'Shop not found.' });

    const shopId = shops[0].id;

    await conn.query(
      `INSERT INTO products (shop_id, name, price, unit_type, stock, category, product_image, quantity)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        shopId,
        name,
        price,
        unit_type,
        Number.isFinite(Number(stock)) ? Number(stock) : 0,
        category ?? null,
        product_image ?? null,
        quantity ?? null,
      ]
    );

    res.json({ message: 'Product added successfully.' });
  } catch (err) {
    console.error('addProduct error:', err);
    res.status(500).json({ message: 'Insert failed.' });
  } finally {
    conn.release();
  }
};

// 📋 Get all products for a shop owner
export const getProducts = async (req, res) => {
  const ownerId = req.user.id;
  const conn = await pool.getConnection();
  try {
    const [shop] = await conn.query('SELECT id FROM shops WHERE owner_id = ?', [
      ownerId,
    ]);
    if (shop.length === 0)
      return res.status(400).json({ message: 'Shop not found for this user.' });

    const [rows] = await conn.query(
      'SELECT * FROM products WHERE shop_id = ? ORDER BY created_at DESC',
      [shop[0].id]
    );
    res.json(rows);
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ message: 'Failed to load products.' });
  } finally {
    conn.release();
  }
};

// 🧱 Get single product
export const getProductById = async (req, res) => {
  const productId = req.params.id;
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM products WHERE id = ?', [
      productId,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'Product not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ message: 'Read error.' });
  } finally {
    conn.release();
  }
};

// ✏️ Update (now persists product_image and quantity)
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, unit_type, stock, category, product_image, quantity } =
    req.body;

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `UPDATE products
         SET name = ?, price = ?, unit_type = ?, stock = ?, category = ?, product_image = ?, quantity = ?
       WHERE id = ?`,
      [
        name,
        price,
        unit_type,
        Number.isFinite(Number(stock)) ? Number(stock) : 0,
        category ?? null,
        product_image ?? null,
        quantity ?? null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product updated.' });
  } catch (err) {
    console.error('updateProduct error:', err);
    res.status(500).json({ message: 'Update failed.' });
  } finally {
    conn.release();
  }
};

// 🗑️ Delete
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query('DELETE FROM products WHERE id = ?', [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    res.status(500).json({ message: 'Delete failed.' });
  } finally {
    conn.release();
  }
};
