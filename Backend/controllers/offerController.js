import pool from '../config/db.js';

// Helper to get shop_id from owner_id
async function getShopId(ownerId, conn) {
  const [shops] = await conn.query('SELECT id FROM shops WHERE owner_id = ?', [
    ownerId,
  ]);
  if (shops.length === 0) throw new Error('Shop not found.');
  return shops[0].id;
}

// 🎁 Add a new offer
export const addOffer = async (req, res) => {
  const ownerId = req.user.id;
  const { title, description, banner_image_url } = req.body;
  if (!title || !banner_image_url) {
    return res
      .status(400)
      .json({ message: 'Title and banner image are required.' });
  }

  const conn = await pool.getConnection();
  try {
    const shopId = await getShopId(ownerId, conn);
    await conn.query(
      'INSERT INTO offers (shop_id, title, description, banner_image_url) VALUES (?, ?, ?, ?)',
      [shopId, title, description || null, banner_image_url]
    );
    res.status(201).json({ message: 'Offer added successfully.' });
  } catch (err) {
    console.error('addOffer error:', err);
    res.status(500).json({ message: err.message || 'Failed to add offer.' });
  } finally {
    conn.release();
  }
};

// 🖼️ Get all offers for a shop
export const getOffers = async (req, res) => {
  const ownerId = req.user.id;
  const conn = await pool.getConnection();
  try {
    const shopId = await getShopId(ownerId, conn);
    const [offers] = await conn.query(
      'SELECT * FROM offers WHERE shop_id = ? AND is_active = TRUE ORDER BY created_at DESC',
      [shopId]
    );
    res.json(offers);
  } catch (err) {
    console.error('getOffers error:', err);
    res.status(500).json({ message: err.message || 'Failed to load offers.' });
  } finally {
    conn.release();
  }
};

// 📄 NEW: Get a single offer by ID
export const getOfferById = async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const shopId = await getShopId(ownerId, conn);
    const [offers] = await conn.query(
      'SELECT * FROM offers WHERE id = ? AND shop_id = ?',
      [id, shopId]
    );
    if (offers.length === 0) {
      return res.status(404).json({ message: 'Offer not found.' });
    }
    res.json(offers[0]);
  } catch (err) {
    console.error('getOfferById error:', err);
    res.status(500).json({ message: err.message || 'Failed to load offer.' });
  } finally {
    conn.release();
  }
};

// ✏️ NEW: Update an existing offer
export const updateOffer = async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;
  const { title, description, banner_image_url } = req.body;
  if (!title || !banner_image_url) {
    return res
      .status(400)
      .json({ message: 'Title and banner image are required.' });
  }

  const conn = await pool.getConnection();
  try {
    const shopId = await getShopId(ownerId, conn);
    const [result] = await conn.query(
      'UPDATE offers SET title = ?, description = ?, banner_image_url = ? WHERE id = ? AND shop_id = ?',
      [title, description || null, banner_image_url, id, shopId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Offer not found or permission denied.' });
    }
    res.json({ message: 'Offer updated successfully.' });
  } catch (err) {
    console.error('updateOffer error:', err);
    res.status(500).json({ message: err.message || 'Failed to update offer.' });
  } finally {
    conn.release();
  }
};

// 🗑️ Delete an offer
export const deleteOffer = async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const shopId = await getShopId(ownerId, conn);
    const [result] = await conn.query(
      'DELETE FROM offers WHERE id = ? AND shop_id = ?',
      [id, shopId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Offer not found or you do not have permission.' });
    }
    res.json({ message: 'Offer deleted successfully.' });
  } catch (err) {
    console.error('deleteOffer error:', err);
    res.status(500).json({ message: err.message || 'Failed to delete offer.' });
  } finally {
    conn.release();
  }
};
