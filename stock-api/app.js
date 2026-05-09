// 1. Importación de módulos
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cron     = require('node-cron');
const path     = require('path');

const app = express();

// 2. Middleware y motor de plantillas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// 3. Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// 4. Rutas
app.use('/api/auth',   require('./src/routes/authRoutes'));
app.use('/api/libros', require('./src/routes/libroRoutes'));

// 5. Dashboard (Plantilla EJS)
const Libro = require('./src/models/Libro');

app.get('/dashboard', async (req, res) => {
  try {
    const libros = await Libro.find(); 
    res.render('dashboard', { libros });
  } catch (err) {
    res.status(500).send('Error al cargar el dashboard de la librería.');
  }
});
//login
app.get('/login', (req, res) => {
    res.render('login');
});

// 6. Cron Job — Revisión de stock de libros cada minuto
cron.schedule('* * * * *', async () => {
  console.log('\nRevisando inventario de la librería...');
  try {
    // Consulta: libros con stock bajo que AÚN no tienen alerta activa
    const librosEnAlerta = await Libro.find({
      $expr: { $lt: ['$cantidad', '$umbralMinimo'] },
      estadoAlerta: false
    });

    if (librosEnAlerta.length === 0) {
      console.log('Todo el inventario de libros está en orden.');
      return;
    }

    for (const libro of librosEnAlerta) {
      // Mensajería: simula envío de alerta adaptada a un libro
      console.log(`[ALERTA SMS]: El libro "${libro.titulo}" (Autor: ${libro.autor}) tiene stock bajo. Quedan: ${libro.cantidad} / Mínimo: ${libro.umbralMinimo}`);

      // Actualización: marca la alerta como enviada para no repetirla
      await Libro.findByIdAndUpdate(libro._id, { $set: { estadoAlerta: true } });
    }
  } catch (err) {
    console.error('Error durante la revisión:', err.message);
  }
});

// 7. Arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
});