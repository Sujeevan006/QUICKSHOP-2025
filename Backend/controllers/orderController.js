// E:\Axivers\NearBuy Project\shop-backend\controllers\orderController.js

import pool from '../config/db.js';

// 📋 Shop owner can see all orders for their shop
export const getOrders = async (req, res) => {
  const ownerId = req.user.id;
  const conn = await pool.getConnection();
  try {
    const [shop] = await conn.query('SELECT id FROM shops WHERE owner_id = ?', [
      ownerId,
    ]);
    if (shop.length === 0)
      return res.status(400).json({ message: 'No shop found for this owner.' });

    const shopId = shop[0].id;
    const [orders] = await conn.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.shop_id = ?
       ORDER BY o.created_at DESC`,
      [shopId]
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load orders.' });
  } finally {
    conn.release();
  }
};

// 🚚 Update order status
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['PENDING', 'PACKING', 'DELIVERED'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: 'Invalid status value.' });

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Order not found.' });
    res.json({ message: `Order marked as ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Status update failed.' });
  } finally {
    conn.release();
  }
};
