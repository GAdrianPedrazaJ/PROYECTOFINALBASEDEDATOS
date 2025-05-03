//trabajo realizado por javier adrian pedraza garcia



const { Client } = require('pg');

// Datos de conexión con Supabase
const client = new Client({
    host: 'aws-0-us-west-1.pooler.supabase.com', 
    port: 5432,                                  
    user: 'postgres.qoikvqxwrymvwgppitco',        
    password: 'ProyectoBD2025.',                   
    database: 'postgres',                        
    ssl: {
        rejectUnauthorized: false                
    }
});

client.connect((error) => {
    if (error) {
        console.log('Error conectando con la base de datos:', error);
        return;
    } else {
        console.log('Conectado con la base de datos');
    }
});

module.exports = client;

//PARA INICIAR Y QUE SE AUTO ACTUALICE ES node --watch index.js
