
import prompt from 'prompt-sync';
import pkg from 'transbank-sdk'; // Transbanck | ES6 Modules
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;
import express from 'express'; // Express | ES6 Modules
import morgan from 'morgan'; // Morgan | ES6 Modules
import createTransaction from './Model/crear-transaccion.js';
import confirmTransaction from './Model/confirmar-transaccion.js';

// Configuración express y puerto
const app = express();
const port = 3000;

// Middleware personalizado (usado en este programa: global)
const myLogger = function (req, res, next) {
    console.log('estas LOGGED');
    next();
}

// Middlewares globales. Pasar Middleware antes de la petición! 
app.use(morgan('dev')); // con "dev" le indicamos a morgan que estamos en un entorno de desarrollo. Se crea Middleware global (de terceros).
app.use(express.json()); // Middleware de Express global (incorporado) para parsear el cuerpo de la petición. Se crea Middleware.
app.use(myLogger); // Middleware personalizado (de uso global)


createTransaction().catch(console.error);
confirmTransaction().catch(console.error);

// port: puerto en el que se ejecutará el servidor
// callback: función que se ejecutará cuando el servidor esté listo
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});