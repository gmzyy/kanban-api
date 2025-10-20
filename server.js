console.log("✅ server.js cargado");

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Ruta base
app.get('/', (req, res) => {
  res.send('✅ API funcionando correctamente');
});

// Rutas API
app.use('/api/users', require('./routes/users'));
app.use('/api/columns', require('./routes/columns'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects')); // <-- ✅ NUEVA RUTA AÑADIDA

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
