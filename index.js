const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/usuarios', require('./rutas/usuarios'));
app.use('/api/productos', require('./rutas/productos'));
app.use('/api/pedidos', require('./rutas/pedidos'));
app.use('/api/items_pedido', require('./rutas/items_pedido'));
app.use('/api/productos_usuarios', require('./rutas/productos_usuarios'));
app.use('/api/mensajes_contacto', require('./rutas/mensajes_contacto'));

// Ruta de prueba
app.get('/api/prueba', (req, res) => {
  res.send('API funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/api`);
});

