const express = require('express');
const router = express.Router();
const client = require('../bd');

// Crear un item en un pedido
router.post('/insertar', (req, res) => {
  const { pedido_id, producto_id, cantidad, precio_unitario } = req.body;
  const query = `
    INSERT INTO items_pedido (pedido_id, producto_id, cantidad, precio_unitario)
    VALUES ($1, $2, $3, $4)
  `;
  client.query(query, [pedido_id, producto_id, cantidad, precio_unitario])
    .then(() => res.status(201).json({ mensaje: 'Item en pedido creado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Obtener todos los items en pedidos
router.get('/obtener', (req, res) => {
  client.query('SELECT * FROM items_pedido')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Actualizar un item en pedido
router.put('/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { pedido_id, producto_id, cantidad, precio_unitario } = req.body;
  const query = `
    UPDATE items_pedido
    SET pedido_id=$1, producto_id=$2, cantidad=$3, precio_unitario=$4
    WHERE id=$5
  `;
  client.query(query, [pedido_id, producto_id, cantidad, precio_unitario, id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Item no encontrado' });
      res.status(200).json({ mensaje: 'Item actualizado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Eliminar un item de un pedido
router.delete('/eliminar/:id', (req, res) => {
  client.query('DELETE FROM items_pedido WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Item no encontrado' });
      res.status(200).json({ mensaje: 'Item eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;


