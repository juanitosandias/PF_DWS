const User = require('../models/User');
const jwt  = require('jsonwebtoken');

// Lógica para registrar un usuario
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ error: 'El nombre de usuario y la contraseña son obligatorios.' });
    }

    const nuevoUsuario = new User({ username, password });
    
    // Al hacer save(), Mongoose ejecutará automáticamente el userSchema.pre('save') 
    await nuevoUsuario.save(); 

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
  } catch (err) {
    // Si el usuario ya existe, mandamos un error
    if (err.code === 11000) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });
    }
    res.status(500).json({ error: 'Error al registrar el usuario.', detalle: err.message });
  }
};

// Lógica para iniciar sesión
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscamos al usuario en la base de datos
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    // Usamos el método personalizado que creaste en User.js para comparar
    const passwordValido = await user.compararPassword(password);
    if (!passwordValido) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    // Si todo es correcto, generamos el Token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET || 'clave_secreta_de_respaldo', 
      { expiresIn: '2h' } // El token caduca en 2 horas
    );

    res.json({ mensaje: 'Login exitoso', token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión.', detalle: err.message });
  }
};