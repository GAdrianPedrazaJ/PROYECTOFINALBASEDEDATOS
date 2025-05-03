const { Client } = require('pg');

// Datos de conexión
const client = new Client({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.qoikvqxwrymvwgppitco',
  password: 'ProyectoBD2025.'
});

// Conectar a la base de datos
client.connect()
  .then(() => console.log('Conectado a la base de datos'))
  .catch(err => console.error('Error al conectar a la base de datos', err));

module.exports = client;
