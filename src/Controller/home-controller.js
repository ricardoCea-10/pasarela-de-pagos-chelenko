import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;
import express, { json } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import createTransaction, { amount as monto } from '../Model/Service/crear-transaccion.js'; // Importar función crear transaccion
import confirmTransaction from '../Model/Service/confirmar-transaccion.js'; // Importar función confirmar transaccion
import consultarTransaccion from '../Model/Service/estado-transaccion.js'; // Importar la función de consulta de transacción  
import axios from 'axios';
import { fileURLToPath } from 'url';  // Importar `fileURLToPath` desde `url` para manejar ES Modules
import { dirname } from 'path';        // Importar `dirname` desde `path` para obtener el directorio
import path from 'path';
dotenv.config();


// Definir `__dirname` manualmente para un entorno de ES Module
const __filename = fileURLToPath(import.meta.url);  // Convertir la URL del módulo en una ruta de archivo
const __dirname = dirname(__filename);              // Obtener el nombre del directorio actual

function main() {
    const app = express();
    const port = 3000;

    // Configurar Express para servir archivos estáticos (como CSS)
    app.use(express.static('public'));

    // Middleware para registrar solicitudes y parsear datos JSON y URL encoded
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Configura el ruteo de las vistas
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    // Ruta para la página inicial con el botón de pago
    app.get('/', (req, res) => {
        res.render('form', { monto });
    });
    
    // Ruta para crear la transacción con Transbank
    app.post('/iniciar-pago', async (req, res) => {
        try {
            // const monto = req.body.monto; // Obtener el monto desde el formulario

            /* 
            * Configuración de la transacción: 
            * - Generación de identificadores únicos para la orden de compra y la sesión.
            * - Definición del monto a cobrar (en pesos) y la URL de retorno, que es la dirección a la que Transbank redirigirá después del pago.
            */
            let buyOrder = `orden_${Date.now()}`; // Crear un identificador único
            let sessionId = `sesion_${Date.now()}`;
            let amount = 9999; // Este es el monto que estás cobrando

            let response = await createTransaction(buyOrder, sessionId, amount);
            if (response && response.formAction && response.tokenWs) {
                // Redirigir al usuario directamente al formulario de Webpay
                res.redirect(`${response.formAction}?token_ws=${response.tokenWs}`);
            } else {
                throw new Error('Error al crear la transacción');
            }
        } catch (error) {
            console.error('Error al crear la transacción:', error);
            res.status(500).send('Error al iniciar la transacción');
        }
    });
    
    // Ruta para manejar el retorno de Transbank
    app.all('/retorno', async (req, res) => {
        // Obtener parámetros del cuerpo o query, según el método
        let tokenWs2 = req.body.token_ws || req.query.token_ws;
        let tbkToken = req.body.TBK_TOKEN || req.query.TBK_TOKEN;
        let tbkOrdenCompra = req.body.TBK_ORDEN_COMPRA || req.query.TBK_ORDEN_COMPRA;
        let tbkIdSesion = req.body.TBK_ID_SESION || req.query.TBK_ID_SESION;
    
        // Mostrar los datos recibidos para depuración
        console.log("Request Body:", req.body);
        console.log("Request Query:", req.query);
        console.log("Mostramos datos recibidos por Transbank");
        console.log('token_ws:', tokenWs2);
        console.log('TBK_TOKEN:', tbkToken);
        console.log('TBK_ORDEN_COMPRA:', tbkOrdenCompra);
        console.log('TBK_ID_SESION:', tbkIdSesion);
        console.log('');

        try {
            // Si existe token_ws, la transacción fue exitosa o rechazada
            if (tokenWs2) {
                // await consultarTransaccion(tokenWs2);
                let confirmation = await confirmTransaction(tokenWs2);
                console.log('Transacción correcta. El pago ha sido aprobado o rechazado.');
                if (confirmation.response_code === 0) {
                    let formaAbono;
                    switch (confirmation.payment_type_code) {
                        case 'VD':
                            formaAbono = 'Débito';
                            break;
                        case 'VN':
                            formaAbono = 'Crédito (Venta Normal)';
                            break;
                        case 'VC':
                            formaAbono = 'Crédito (Venta en Cuotas)';
                            break;
                        case 'SI':
                            formaAbono = 'Crédito (Cuotas Sin Interés)';
                            break;
                        case 'S2':
                            formaAbono = 'Crédito (2 Cuotas Sin Interés)';
                            break;
                        case 'NC':
                            formaAbono = 'Crédito (N Cuotas)';
                            break;
                        default:
                            formaAbono = 'Desconocido';
                    }
                    console.log("El pago ha sido aprobado");
                    res.render('pago-aprobado', {
                        titular: 'Nombre del titular', // Aquí deberías reemplazar con el valor real si está disponible
                        tarjeta: confirmation.card_detail.card_number,
                        monto: confirmation.amount,
                        forma_abono: formaAbono, // Forma de abono interpretada
                        fecha_hora: confirmation.transaction_date,
                        codigo_transaccion: confirmation.buy_order,
                        codigo_autorizacion: confirmation.authorization_code,
                        // objeto:
                        objeto_confirmacion: confirmation
                    });
                } else {
                    console.log("El pago ha sido rechazado");
                    res.redirect('/pago-rechazado');
                }
            }
            // Si existe TBK_TOKEN, TBK_ORDEN_COMPRA y TBK_ID_SESION, el pago fue abortado
            else if (tbkToken && tbkOrdenCompra && tbkIdSesion) {
                console.log('Transacción abortada.');
                res.redirect('/pago-rechazado');
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

    // Ruta para mostrar la pantalla de pago rechazado
    app.get('/pago-rechazado', (req, res) => {
        res.sendFile(path.join(__dirname, '../views', 'pago-rechazado.html'));  
    });
    
    // Ruta para consultar el estado de una transacción
    app.get('/consultar-transaccion/:token', async (req, res) => {
        const token = req.params.token; // Obtener el token de la URL
        try {
            const response = await consultarTransaccion(token);
            if (response) {
                res.json(response); // Retornar la respuesta en formato JSON
            } else {
                res.status(404).send('Transacción no encontrada');
            }
        } catch (error) {
            console.error('Error al consultar la transacción:', error);
            res.status(500).send('Error al consultar el estado de la transacción');
        }
    });
   

    app.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });

    app.post('/postear-datos', async(req, res) => {

        IdGuest

        try{
            const response = await axios.post("http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank",)  
            res,json(response.data)
        } catch (error)  {
            console.error('eror al enviar datos:', error);
            res.status(500).send('error al enviar datos');
        }
    })
    

}
export default main;
