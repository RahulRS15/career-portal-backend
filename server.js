const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const companiesRoutes = require('./routes/companiesRoutes')
const applicationRoutes = require('./routes/applicationRoutes')

app.use("/api/auth", authRoutes);
app.use("/api/users",   userRoutes);
app.use("/api/jobs",    jobRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/applications", applicationRoutes);

app.get('/', (_req, res) => res.json({ message: 'Career Portal API is running 🚀' }));

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/career_portal')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
