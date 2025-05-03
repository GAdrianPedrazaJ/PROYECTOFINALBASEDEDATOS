
//trabajo realizado por javier adrian pedraza garcia



const express = require('express');
const client = require('./db'); 
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});


//PARA INICIAR Y QUE SE AUTO ACTUALICE ES node --watch index.js