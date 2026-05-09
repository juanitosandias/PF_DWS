const express = require('express');
const router = express.Router();
const Libro = require('../models/Libro');
const verificarToken = require('../middlewares/auth');

// GET /api/libros — Pública: lista todos los libros
router.get('/', async (req, res) => {
  try {
    const libros = await Libro.find();
    res.json(libros);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el catálogo de libros.', detalle: err.message });
  }
});

// POST /api/libros — Protegida: registra un nuevo libro en el inventario
router.post('/', verificarToken, async (req, res) => {
  try {
    // Adaptado a la estructura de una librería
    const { titulo, autor, isbn, cantidad, umbralMinimo } = req.body;
    
    if (!titulo || !autor || cantidad == null || umbralMinimo == null) {
      return res.status(400).json({ error: 'Faltan campos requeridos: titulo, autor, cantidad o umbralMinimo.' });
    }

    const libro = new Libro({ titulo, autor, isbn, cantidad, umbralMinimo });
    await libro.save();
    
    res.status(201).json({ mensaje: 'Libro registrado exitosamente.', libro });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el libro.', detalle: err.message });
  }
});

// PATCH /api/libros/:id — Protegida: actualiza el stock manualmente
router.patch('/:id', verificarToken, async (req, res) => {
  try {
    const { cantidad } = req.body;
    
    if (cantidad == null) {
      return res.status(400).json({ error: 'Debes enviar la nueva cantidad de stock.' });
    }

    // Al actualizar el stock manualmente, la alerta vuelve a estar inactiva
    const actualizado = await Libro.findByIdAndUpdate(
      req.params.id,
      { $set: { cantidad, estadoAlerta: false } },
      { new: true } // Para que devuelva el documento con los datos nuevos
    );

    if (!actualizado) {
      return res.status(404).json({ error: 'Libro no encontrado en la base de datos.' });
    }

    res.json({ mensaje: 'Stock del libro actualizado correctamente.', libro: actualizado });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el inventario.', detalle: err.message });
  }
});

// DELETE /api/libros/:id — Protegida: elimina un libro del inventario
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const libroEliminado = await Libro.findByIdAndDelete(req.params.id);
    
    if (!libroEliminado) {
      return res.status(404).json({ error: 'Libro no encontrado en la base de datos.' });
    }

    res.json({ mensaje: 'Libro eliminado exitosamente del inventario.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el libro.', detalle: err.message });
  }
});

module.exports = router;