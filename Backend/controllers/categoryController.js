import pool from '../config/db.js';

// Helper to get shop_id from owner_id
async function getShopId(ownerId, conn) {
  const [shops] = await conn.query('SELECT id FROM shops WHERE owner_id = ?', [
    ownerId,
  ]);
  if (shops.length === 0) throw new Error('Shop not found.');
  return shops[0].id;
}

// 🏷️ Add a new category
export const addCategory = async (req, res) => {
  const ownerId = req.user.id;
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: 'Category name is required.' });

  const conn = await pool.getConnection();
  try {
    const shopId = await getShopId(ownerId, conn);
    await conn.query('INSERT INTO categories (shop_id, name) VALUES (?, ?)', [
      shopId,
      name,
    ]);
    res.status(201).json({ message: 'Category added successfully.' });
  } catch (err) {
    console.error('addCategory error:', err);
    res.status(500).json({ message: err.message || 'Failed to add category.' });
  } finally {
    conn.release();
  }
};

// 📋 Get all categories for a shop
export const getCategories = async (req, res) => {
  const ownerId = req.user.id;
  const conn = await pool.getConnection();
  try {
    const shopId = await getShopId(ownerId, conn);
    const [categories] = await conn.query(
      'SELECT * FROM categories WHERE shop_id = ? ORDER BY name ASC',
      [shopId]
    );
    res.json(categories);
  } catch (err) {
    console.error('getCategories error:', err);
    res
      .status(500)
      .json({ message: err.message || 'Failed to load categories.' });
  } finally {
    conn.release();
  }
};

// ✏️ NEW: Update a category
export const updateCategory = async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }
  const conn = await pool.getConnection();
  try {
    const shopId = await getShopId(ownerId, conn);
    const [result] = await conn.query(
      'UPDATE categories SET name = ? WHERE id = ? AND shop_id = ?',
      [name, id, shopId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Category not found or permission denied.' });
    }
    res.json({ message: 'Category updated successfully.' });
  } catch (err) {
    console.error('updateCategory error:', err);
    res
      .status(500)
      .json({ message: err.message || 'Failed to update category.' });
  } finally {
    conn.release();
  }
};

// 🗑️ Delete a category
export const deleteCategory = async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const shopId = await getShopId(ownerId, conn);
    const [result] = await conn.query(
      'DELETE FROM categories WHERE id = ? AND shop_id = ?',
      [id, shopId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message:
          'Category not found or you do not have permission to delete it.',
      });
    }
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res
      .status(500)
      .json({ message: err.message || 'Failed to delete category.' });
  } finally {
    conn.release();
  }
};
