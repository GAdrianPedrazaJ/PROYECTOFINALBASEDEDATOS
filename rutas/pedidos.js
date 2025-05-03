const express = require('express');
const router = express.Router();
const client = require('../bd');

// Crear un pedido
router.post('/insertar', (req, res) => {
  const { usuario_id, monto_total, estado, direccion_envio } = req.body;
  const query = `
    INSERT INTO pedidos (usuario_id, monto_total, estado, direccion_envio)
    VALUES ($1, $2, $3, $4)
  `;
  client.query(query, [usuario_id, monto_total, estado, direccion_envio])
    .then(() => res.status(201).json({ mensaje: 'Pedido creado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Obtener todos los pedidos
router.get('/obtener', (req, res) => {
  client.query('SELECT * FROM pedidos')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Actualizar un pedido
router.put('/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { usuario_id, monto_total, estado, direccion_envio } = req.body;
  const query = `
    UPDATE pedidos
    SET usuario_id=$1, monto_total=$2, estado=$3, direccion_envio=$4
    WHERE id=$5
  `;
  client.query(query, [usuario_id, monto_total, estado, direccion_envio, id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      res.status(200).json({ mensaje: 'Pedido actualizado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Eliminar un pedido
router.delete('/eliminar/:id', (req, res) => {
  client.query('DELETE FROM pedidos WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      res.status(200).json({ mensaje: 'Pedido eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;


