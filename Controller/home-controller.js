
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

    // Configurar middleware para analizar datos de formulario
    app.use(express.urlencoded({ extended: true }));
    // Middlewares globales. Pasar Middleware antes de la petición! 
    app.use(morgan('dev')); // con "dev" le indicamos a morgan que estamos en un entorno de desarrollo. Se crea Middleware global (de terceros).
    app.use(express.json()); // Middleware de Express global (incorporado) para parsear el cuerpo de la petición. Se crea Middleware.
    app.use(myLogger); // Middleware personalizado (de uso global)

    // mostramos info por consola de las respuestas de transbanck y datos relevantes
    createTransaction().catch(console.error);
    confirmTransaction().catch(console.error);

    // Ruta para generar la transacción y mostrar el formulario con datos dinámicos
    app.get('/checkout', async (req, res) => {

        const theResponse = await createTransaction(); // Llama a tu función para crear la transacción
        // Renderiza el formulario con los datos obtenidos
        res.render('pantalla-pagos', { theResponse }); // 'form.ejs' es el archivo EJS que contiene tu formulario de pruebas
        // res.status(200).json({theResponse}); // respuesta en formato json
    });


    // Ruta para manejar la respuesta de Transbank
    app.all('/retorno-pago', (req, res) => {
        let tokenWs;
        let tbkToken;
        let tbkOrdenCompra;
        let tbkIdSesion;

        // Verificar si la solicitud viene por POST o GET
        if (req.method === 'POST') {
            // Si el método es POST, extraer los parámetros del cuerpo de la solicitud
            tokenWs = req.body.token_ws;
            tbkToken = req.body.TBK_TOKEN;
            tbkOrdenCompra = req.body.TBK_ORDEN_COMPRA;
            tbkIdSesion = req.body.TBK_ID_SESION;
        } else if (req.method === 'GET') {
            // Si el método es GET, extraer los parámetros de la URL
            tokenWs = req.query.token_ws;
            tbkToken = req.query.TBK_TOKEN;
            tbkOrdenCompra = req.query.TBK_ORDEN_COMPRA;
            tbkIdSesion = req.query.TBK_ID_SESION;
        }

        // Lógica para manejar las diferentes respuestas
        if (tokenWs) {
            // Si existe token_ws, la transacción fue exitosa
            console.log('Transacción exitosa. Token: ${tokenWs}');
            res.send('Pago aprobado. Gracias por su compra.');
        } else if (tbkToken) {
            // Si existe TBK_TOKEN, la transacción fue rechazada o hubo un error
            console.log('Transacción rechazada o error. Orden: ${tbkOrdenCompra}, Sesión: ${tbkIdSesion}');
            res.send('Pago rechazado. Por favor, intente nuevamente.');
        } else {
            // Si no se encuentra ninguna variable, indicar un error
            console.log('Error en el proceso de pago. No se encontraron parámetros.');
            res.status(400).send('Error en el proceso de pago. No se encontraron parámetros.');
        }
    });





    // port: puerto en el que se ejecutará el servidor
    // callback: función que se ejecutará cuando el servidor esté listo
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });

}

export default main;

