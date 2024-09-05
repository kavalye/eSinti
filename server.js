const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // React uygulamanızın çalıştığı adres
  credentials: true,
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));


// Connect Database
connectDB();

// Routes
app.get('/', (req, res) => res.send('eSinti API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Statik Dosyalar
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
