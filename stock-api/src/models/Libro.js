const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
  titulo: { 
    type: String, 
    required: true, 
    trim: true 
  },
  autor: { 
    type: String, 
    required: true, 
    trim: true 
  },
  isbn: { 
    type: String, 
    trim: true 
  },
  cantidad: { 
    type: Number, 
    required: true, 
    min: [0, 'La cantidad en stock no puede ser negativa'] // Mensaje de error
  },
  umbralMinimo: { 
    type: Number, 
    required: true, 
    min: [0, 'El umbral mínimo no puede ser negativo'] 
  },
  estadoAlerta: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
  versionKey: false // Oculta el campo __v interno de Mongoose en las respuestas JSON
});

module.exports = mongoose.model('Libro', libroSchema);