
import prompt from 'prompt-sync';
import pkg from 'transbank-sdk'; // Transbanck | ES6 Modules
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;
import express from 'express'; // Express | ES6 Modules
import morgan from 'morgan'; // Morgan | ES6 Modules
import createTransaction from '../Model/crear-transaccion.js';
import confirmTransaction from '../Model/confirmar-transaccion.js';


function main() {

    // Configuración express y puerto
    const app = express();
    const port = 3000;
    // Configurar EJS como el motor de plantillas
    app.set('view engine', 'ejs');

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

    // Ruta para generar la transacción y mostrar el formulario con datos dinámicos
    app.get('/pagar', async (req, res) => {

        const theResponse = await createTransaction(); // Llama a tu función para crear la transacción
        // Renderiza el formulario con los datos obtenidos
        res.render('form', { theResponse }); // 'pago.ejs' es el archivo EJS que contiene tu formulario
    });

    // port: puerto en el que se ejecutará el servidor
    // callback: función que se ejecutará cuando el servidor esté listo
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });

}

export default main;

