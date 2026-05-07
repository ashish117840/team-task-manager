require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');  

// Force Node's DNS resolver to use public resolvers to avoid local SRV failures
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 5000;
const maxRetries = parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10);
const retryDelay = parseInt(process.env.MONGO_CONNECT_RETRY_MS || '5000', 10);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes); 

// Health check
app.get('/', (req, res) => res.json({ message: 'API running ✅' }));

// Connect DB + Start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('❌ DB Error:', err.message));