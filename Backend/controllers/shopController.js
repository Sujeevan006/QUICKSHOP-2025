import pool from '../config/db.js';

// 🔹 GET all shops
export const getAllShops = async (_req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT s.*, u.name AS owner_name FROM shops s JOIN users u ON s.owner_id=u.id ORDER BY s.created_at DESC'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load shops' });
  } finally {
    conn.release();
  }
};

// 🔹 GET one shop + its products, categories, and offers
export const getShopById = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const [[shop]] = await conn.query('SELECT * FROM shops WHERE id=?', [id]);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    // Fetch products (as before)
    const [products] = await conn.query(
      'SELECT * FROM products WHERE shop_id=?',
      [id]
    );

    // 👇 Fetch categories from the `categories` table
    const [categories] = await conn.query(
      'SELECT * FROM categories WHERE shop_id=? ORDER BY name ASC',
      [id]
    );

    // 👇 Fetch active offers from the `offers` table
    const [offers] = await conn.query(
      'SELECT * FROM offers WHERE shop_id=? AND is_active = TRUE ORDER BY created_at DESC',
      [id]
    );

    // 👇 Return all data in one response
    res.json({ shop, products, categories, offers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load shop' });
  } finally {
    conn.release();
  }
};
