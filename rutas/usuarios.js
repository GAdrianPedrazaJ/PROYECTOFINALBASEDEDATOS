const express = require('express');
const router = express.Router();
const client = require('../bd');

// Crear un usuario
router.post('/insertar', (req, res) => {
  const { correo, nombre_completo, telefono, direccion } = req.body;
  const query = `
    INSERT INTO usuarios (correo, nombre_completo, telefono, direccion)
    VALUES ($1, $2, $3, $4)
  `;
  client.query(query, [correo, nombre_completo, telefono, direccion])
    .then(() => res.status(201).json({ mensaje: 'Usuario creado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Obtener todos los usuarios
router.get('/obtener', (req, res) => {
  client.query('SELECT * FROM usuarios')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Actualizar un usuario
router.put('/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { correo, nombre_completo, telefono, direccion } = req.body;
  const query = `
    UPDATE usuarios
    SET correo=$1, nombre_completo=$2, telefono=$3, direccion=$4
    WHERE id=$5
  `;
  client.query(query, [correo, nombre_completo, telefono, direccion, id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json({ mensaje: 'Usuario actualizado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Eliminar un usuario
router.delete('/eliminar/:id', (req, res) => {
  client.query('DELETE FROM usuarios WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json({ mensaje: 'Usuario eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;

