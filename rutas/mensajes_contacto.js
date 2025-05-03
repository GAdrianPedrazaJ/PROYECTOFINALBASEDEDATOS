const express = require('express');
const router = express.Router();
const client = require('../bd');

// Crear un mensaje de contacto
router.post('/insertar', (req, res) => {
  const { usuario_id, nombre, correo, mensaje } = req.body;
  const query = `
    INSERT INTO mensajes_contacto (usuario_id, nombre, correo, mensaje)
    VALUES ($1, $2, $3, $4)
  `;
  client.query(query, [usuario_id, nombre, correo, mensaje])
    .then(() => res.status(201).json({ mensaje: 'Mensaje enviado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Obtener todos los mensajes de contacto
router.get('/obtener', (req, res) => {
  client.query('SELECT * FROM mensajes_contacto')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Marcar mensaje como respondido
router.put('/responder/:id', (req, res) => {
  client.query(
    'UPDATE mensajes_contacto SET fue_respondido = TRUE WHERE id = $1',
    [req.params.id]
  )
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Mensaje no encontrado' });
      res.status(200).json({ mensaje: 'Mensaje marcado como respondido' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Eliminar un mensaje de contacto
router.delete('/eliminar/:id', (req, res) => {
  client.query('DELETE FROM mensajes_contacto WHERE id = $1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Mensaje no encontrado' });
      res.status(200).json({ mensaje: 'Mensaje eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
