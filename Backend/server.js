// E:\Axivers\NearBuy Project\shop-backend\server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import('./config/db.js'); // initialize pool
import categoryRoutes from './routes/categoryRoutes.js'; // 👈 Add this
import offerRoutes from './routes/offerRoutes.js'; // 👈 Add this

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- create app ----
const app = express();

// ---- CORS ----
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---- parsers ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/categories', categoryRoutes); // 👈 Add this
app.use('/api/offers', offerRoutes); // 👈 Add this

// ---- static uploads ----
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ---- routes ----
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/upload', uploadRoutes);

// ---- health check ----
app.get('/', (req, res) => res.send('Shop Backend API Running ✅'));

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---- global error handler ----
app.use((err, req, res, _next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ---- start server ----
const PORT = process.env.PORT || 5000;

// find LAN IPv4 to display helpful info
const networks = os.networkInterfaces();
let lanIP = 'localhost';
Object.values(networks).forEach((ifs) => {
  if (Array.isArray(ifs)) {
    ifs.forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        lanIP = iface.address;
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅  Shop Backend API is live`);
  console.log(`   Local:  http://localhost:${PORT}`);
  console.log(`   LAN:    http://${lanIP}:${PORT}\n`);
});
