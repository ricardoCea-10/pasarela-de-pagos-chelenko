
import prompt from 'prompt-sync';
import pkg from 'transbank-sdk'; // Transbanck | ES6 Modules
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;
import express from 'express'; // Express | ES6 Modules
import morgan from 'morgan'; // Morgan | ES6 Modules
import path from 'path';
import { fileURLToPath } from 'url';
import createTransaction from '../Model/crear-transaccion.js';
import confirmTransaction from '../Model/confirmar-transaccion.js';


function main() {

    // Configuración necesaria para trabajar con rutas y ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Configuración express y puerto
    const app = express();
    const port = 3000;

    // Configurar views dentro de src, y EJS como el motor de plantillas
    app.set('views', path.join(__dirname, '..', 'Views')); // Cambiado para apuntar correctamente a la carpeta Views
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


    // mostramos info por consola de las respuestas de transbanck y datos relevantes (solo testing)
    createTransaction().catch(console.error); 
    // confirmTransaction().catch(console.error);


    // Ruta para generar la transacción y mostrar el formulario con datos dinámicos
    app.get('/checkout', async (req, res) => {

        const theResponse = await createTransaction(); // Llama a tu función para crear la transacción
        // Renderiza el formulario con los datos obtenidos
        res.render('pantalla-pagos', { theResponse }); // 'form.ejs' es el archivo EJS que contiene tu formulario de pruebas
        // res.status(200).json({theResponse}); // respuesta en formato json
    });


    // Ruta para manejar la respuesta de Transbank
    app.all('/retorno-pago', async (req, res) => {
       
        let tokenWs2, tbkToken, tbkOrdenCompra, tbkIdSesion;

        //imprimimos el body
        console.log("El BODY: ", req.body);

        // Capturamos las variables de ambas fuentes: req.query (GET) y req.body (POST)
        tokenWs2 = req.body.token_ws || req.query.token_ws; // pago exitoso o rechazado, error en formulario (solo produccion)
        tbkToken = req.body.TBK_TOKEN || req.query.TBK_TOKEN; // pago abortado, error en formulario (solo produccion)
        tbkOrdenCompra = req.body.TBK_ORDEN_COMPRA || req.query.TBK_ORDEN_COMPRA; // pago abortado, Timeout, error en formulario (solo produccion)
        tbkIdSesion = req.body.TBK_ID_SESION || req.query.TBK_ID_SESION; // pago abortado, Timeout, error en formulario (solo produccion)

        // Mostrar los valores que llegaron para revisar en consola
        console.log("Los datos recibidos son:");
        console.log("tokenWs2:", tokenWs2, "tbkToken:", tbkToken, "tbkOrdenCompra:", tbkOrdenCompra, "tbkIdSesion:", tbkIdSesion);

        try {
            // Si existe token_ws, la transacción fue exitosa o rechazada
            if (tokenWs2) {
                await confirmTransaction(tokenWs2); // Confirmar la transacción con el token_ws
                console.log('Transacción correcta. El pago ha sido aprobado o rechazado.');
                res.send('El pago ha sido aprobado o rechazado.');
            } 
            // Si existe TBK_TOKEN, TBK_ORDEN_COMPRA y TBK_ID_SESION, el pago fue abortado
            else if (tbkToken && tbkOrdenCompra && tbkIdSesion) {
                await confirmTransaction(tbkToken); // Confirmar transacción (abortada) con TBK_TOKEN
                console.log('Transacción abortada.');
                res.send('Transacción abortada. Pago rechazado.');
            } 
            // Si existe TBK_ORDEN_COMPRA y TBK_ID_SESION, la transacción ha excedido el tiempo (timeout)
            else if (tbkOrdenCompra && tbkIdSesion) {
                console.log('Transacción abortada por timeout.');
                res.send('Transacción abortada. Timeout.');
            } 
            // Si no se encuentra ninguna variable, indicar un error
            else {
                console.log('Error en el proceso de pago. No se encontraron parámetros.');
                res.status(400).send('Error en el proceso de pago. No se encontraron parámetros.');
            }
        } catch (error) {
            console.error('Error al confirmar la transacción:', error);
            res.status(500).send('Error en el servidor al procesar el pago.');
        }
    });


    // port: puerto en el que se ejecutará el servidor
    // callback: función que se ejecutará cuando el servidor esté listo
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });

}

export default main;

