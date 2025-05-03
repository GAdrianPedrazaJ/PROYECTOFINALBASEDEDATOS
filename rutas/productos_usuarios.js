const express = require('express');
const router = express.Router();
const client = require('../bd');

// Crear un registro de producto de usuario
router.post('/insertar', (req, res) => {
  const { usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado } = req.body;
  const query = `
    INSERT INTO productos_usuarios (usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  client.query(query, [usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado])
    .then(() => res.status(201).json({ mensaje: 'Producto de usuario creado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Obtener todos los productos de usuarios
router.get('/obtener', (req, res) => {
  client.query('SELECT * FROM productos_usuarios')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Actualizar un registro de producto de usuario
router.put('/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado } = req.body;
  const query = `
    UPDATE productos_usuarios
    SET usuario_id=$1, producto_id=$2, pedido_id=$3, cantidad=$4, precio_unitario=$5, estado=$6
    WHERE id=$7
  `;
  client.query(query, [usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado, id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Producto de usuario no encontrado' });
      res.status(200).json({ mensaje: 'Producto de usuario actualizado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Eliminar un producto de usuario
router.delete('/eliminar/:id', (req, res) => {
  client.query('DELETE FROM productos_usuarios WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Producto de usuario no encontrado' });
      res.status(200).json({ mensaje: 'Producto de usuario eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;


