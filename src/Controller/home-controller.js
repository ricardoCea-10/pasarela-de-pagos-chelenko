import 'dotenv/config'; // Importa y configura dotenv sin usar require
import express from 'express';
import morgan from 'morgan';
import createTransaction, { amount as monto } from '../Model/Service/crear-transaccion.js'; // Importar función crear transaccion
import confirmTransaction from '../Model/Service/confirmar-transaccion.js'; // Importar función confirmar transaccion
import checkTransaccion from '../Model/Service/estado-transaccion.js'; // Importar la función de consulta de transacción
import refundTransaccion from '../Model/Service/reversar-anular-transaccion.js';  // Importar la función de anular transacción
import {getData, getDataReservationById, postData, getDataById, updateData, deleteData} from '../Model/Repository/data.js';
import {checkTransactionStatusCode, structureData, structureDataAbort, structureDataTimeOut, structureDataAtlas, structureDataAtlasAbort, structureDataAtlasTimeOut} from '../Model/Utils/helpers.js';
import {validateDataClient, validateDataClientTransbank} from '../Model/Middlewares/validation-middlewares.js';
import { newTransactionDB, getTransactionDBFindOne, getTransactionDBFindByIdAndUpdate} from '../database/service/transaction.service.js';
import { fileURLToPath } from 'url';  // Importar `fileURLToPath` desde `url` para manejar ES Modules
import { dirname } from 'path';        // Importar `dirname` desde `path` para obtener el directorio
import path from 'path';

// Definir `__dirname` manualmente para un entorno de ES Module
const __filename = fileURLToPath(import.meta.url);  // Convertir la URL del módulo en una ruta de archivo
const __dirname = dirname(__filename);              // Obtener el nombre del directorio actual

function main() {
    const app = express();
    const port = process.env.PORT || 3000;

    // Configurar Express para servir archivos estáticos (como CSS)
    app.use(express.static('public'));

    // Middleware para registrar solicitudes y parsear datos JSON y URL encoded
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Configura el ruteo de las vistas
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

//#################################################################################################### 
// ********************************* RUTAS HTTP PARA FLUJO DE PAGO ***********************************
//####################################################################################################     

    /*
    // Ruta para la página inicial con el botón de pago
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../views', 'form.html'));
    });
    */
    
    // Ruta para crear la transacción con Transbank
    app.post('/iniciar-pago', validateDataClient, async (req, res) => {
        try {
            
            // Guardamos la data inicial en nuestra base de datos Mongo DB Atlas:
            await newTransactionDB(req.guest, req.buyOrder, req.sessionId, req.amount);

            // Llamamos a la función crear transacción
            let response = await createTransaction(req.buyOrder, req.sessionId, req.amount, req.returnUrl);

            if (response && response.formAction && response.tokenWs) {

                /*
                // generamos objeto para pasar datos a formato JSON
                let responseCreateTransaction = {
                    tokenWs: response.tokenWs,
                    formAction: response.formAction
                }
                res.status(200).json(responseCreateTransaction); // Pasamos datos a front en formato JSON
                */
                
                // Redirigir al usuario directamente al formulario de Webpay
                res.redirect(`${response.formAction}?token_ws=${response.tokenWs}`);
                
            } else {
                // throw new Error('Error en la respuesta de Transbank');
                res.status(500).send('Error en la respuesta de Transbank');
            }
        } catch (error) {
            console.error('Error al crear la transacción:', error);
            res.status(500).send('Error al crear la transacción');
        }
    });
    
    // Ruta para manejar el retorno de Transbank
    app.all('/retorno', validateDataClientTransbank, async (req, res) => {
        // Ejecutamos middleware de validación de datos de transbank
        // Definimos un flujo de transaccion, dependiendo de los parametros de respuesta de Transbank
        try {
            // Si existe token_ws, la transacción fue exitosa o rechazada
            if (req.tokenWs2) {
                // Confirmamos la Transacción con el SDK de Transbank
                let confirmation = await confirmTransaction(req.tokenWs2);
                if (confirmation !== undefined) {
                    console.log('Transacción correcta. El pago ha sido aprobado o rechazado.');
                } else {
                    console.log('Transacción incorrecta. El pago no ha sido aprobado o rechazado.');
                    throw new Error('Transacción incorrecta. El pago no ha sido aprobado o rechazado.')
                }

                // Recuperamos sessionId:
                let sessionId = confirmation.session_id;

                // consultamos sessionId a la base de datos:
                let dataDB = await getTransactionDBFindOne(sessionId);
                console.log("");
                console.log("BANDERA 40. dataDB (find one):", dataDB);
                console.log("");
                console.log("BANDERA 20. guest (base datos ATLAS):", dataDB.guest);
                console.log("");

                // generamos objeto con datos de respuesta para BD Mongo Atlas
                let transactionDataAtlas = structureDataAtlas(confirmation, req.tokenWs2);
                // generamos objeto con datos de respuesta para BD api
                let transactionData = structureData(dataDB.guest, confirmation, req.tokenWs2);
                
                console.log("BANDERA 44. Data para insertar en BD Atlas", transactionDataAtlas);
                console.log("BANDERA 45. Data para insertar en BD Api", transactionData);
                
                // Enviamos objeto transactionDataAtlas a base de datos Mongo Atlas:
                const dataAtlas = await getTransactionDBFindByIdAndUpdate(dataDB._id, transactionDataAtlas);
                // Enviamos objeto transactionData a base de datos api:
                const dataApi = await postData(transactionData);

                let statusCodeTransbankResponse = checkTransactionStatusCode(confirmation.response_code, confirmation.payment_type_code);
                console.log(statusCodeTransbankResponse);
                res.status(200).json(transactionData);
            }
            // Si existe TBK_TOKEN, TBK_ORDEN_COMPRA y TBK_ID_SESION, el pago fue abortado
            else if (req.tbkToken && req.tbkOrdenCompra && req.tbkIdSesion) {

                 // Checkeamos el estado de la Transacción abortada:
                let response = await checkTransaccion(req.tbkToken);
                // Recuperamos sessionId:
                let sessionId = response.session_id;

                // consultamos sessionId a la base de datos:
                let dataDB = await getTransactionDBFindOne(sessionId);

                console.log("");
                console.log("BANDERA 50. dataDB (find one):", dataDB);
                console.log("");
                console.log("BANDERA 51. guest (base datos ATLAS):", dataDB.guest);
                console.log("");

                // generamos objeto con datos de respuesta para BD Mongo Atlas
                let transactionDataAtlasAbort = structureDataAtlasAbort(response, req.tbkToken);
                // generamos objeto con datos de respuesta para BD api
                let transactionDataAbort = structureDataAbort(dataDB.guest, response, req.tbkToken);

                console.log("BANDERA 52. Data para insertar en BD Atlas", transactionDataAtlasAbort);
                console.log("BANDERA 53. Data para insertar en BD Api", transactionDataAbort);

                // Enviamos objeto transactionDataAtlasAbort a base de datos Mongo Atlas:
                const dataAtlasAbort = await getTransactionDBFindByIdAndUpdate(dataDB._id, transactionDataAtlasAbort);
                // Enviamos objeto transactionDataAbort a base de datos api:
                const dataApiAbort = await postData(transactionDataAbort); 

                console.log("Transacción abortada.");
                res.status(200).send('Transacción abortada.');

            }
            // Si existe TBK_ORDEN_COMPRA y TBK_ID_SESION, la transacción ha excedido el tiempo (timeout)
            else if (req.tbkOrdenCompra && req.tbkIdSesion) {

                // Recuperamos el sessionId y buyOrder
                let sessionId = req.tbkIdSesion;
                let buyOrder = req.tbkOrdenCompra;

                // consultamos sessionId a la base de datos:
                let dataDB = await getTransactionDBFindOne(sessionId);

                console.log("");
                console.log("BANDERA 70. dataDB (find one):", dataDB);
                console.log("");
                console.log("BANDERA 71. guest (base datos ATLAS):", dataDB.guest);
                console.log("");

                // generamos objeto con datos de respuesta para BD Mongo Atlas
                let transactionDataAtlasTimeOut = structureDataAtlasTimeOut();
                // generamos objeto con datos de respuesta para BD api
                let transactionDataTimeOut = structureDataTimeOut(dataDB.guest, sessionId, buyOrder);

                console.log("BANDERA 72. Data para insertar en BD Atlas", transactionDataAtlasTimeOut);
                console.log("BANDERA 73. Data para insertar en BD Api", transactionDataTimeOut);

                // Enviamos objeto transactionDataAtlasTimeOut a base de datos Mongo Atlas:
                const dataAtlasTimeOut = await getTransactionDBFindByIdAndUpdate(dataDB._id, transactionDataAtlasTimeOut);
                // Enviamos objeto transactionDataTimeOut a base de datos api:
                const dataApiTimeOut = await postData(transactionDataTimeOut); 

                console.log('Transacción abortada por timeout.');                
                res.status(200).send('Transacción abortada por timeout.');

            }
            // Si no se encuentra ninguna variable, indicar un error
            else {
                console.log('Error en el proceso de pago. No se encontraron parámetros.');
                res.status(400).send('Error en el proceso de pago. No se encontraron parámetros.');
            }

        } catch (error) {
            console.error('Error al realizar la transacción:', error);
            res.status(500).send('Error al realizar la transacción.');
        }
    });

    /*
    // Ruta para mostrar la pantalla de pago rechazado
    app.get('/pago-rechazado', (req, res) => {
        res.sendFile(path.join(__dirname, '../views', 'pago-rechazado.html'));  
    });
    */
    
//#################################################################################################### 
// ********************************* METODOS DE TRANSBANK ********************************************
//####################################################################################################    

    // Ruta para consultar el estado de una transacción a Transbank
    app.get('/consultar-transaccion', async (req, res) => {
        
        const token = req.query.token; // Obtener el token de los parámetros de consulta (query)
        // confirmamos obtención de token
        if (token) {
            console.log('Token recibido por query:', token);
        } else {
            console.log('No se recibió token por query.');
        }

        try {
            const response = await checkTransaccion(token);
            if (response) {
                res.status(200).json(response); // Retornar la respuesta en formato JSON
            } else {
                res.status(404).send('Transacción no encontrada');
            }
        } catch (error) {
            console.error('Error al consultar la transacción:', error);
            res.status(500).send('Error al consultar el estado de la transacción');
        }
    });

    // Ruta para Reversar o Anular un pago en Transbank
    app.delete('/anular-transaccion', async (req, res) => {

        // obtenemos token y amount por body:
        const token = req.body.token;
        const amount = req.body.amount;

        // confirmamos obtención de token
        if (token && amount) {
            console.log('Token recibido por body:', token);
        } else {
            console.log('No se recibió token por body.');
        }

        try {
            // Enviamos solicitud de reversar o anular un pago a Transbank, recibimos una respuesta.
            const response = await refundTransaccion(token, amount);
            if (response) {
                res.status(200).json(response); // Retornar la respuesta en formato JSON
            } else {
                res.status(404).send('Transacción no encontrada. No se pudo anular');
            }
        } catch (error) {

            console.error('Error al anular la transacción:', error);
            res.status(500).send('Error al anular la transacción');
        }
    });

//#################################################################################################### 
// ********************************* CONSULTAS A BASE DE DATOS ***************************************
//#################################################################################################### 

    // Consultar todas las transacciones
    app.get('/base-datos/consultar-transacciones', async (req, res) => {

        try {
            let response = await getData();
            res.status(200).json(response);
        } catch (error) {
            console.error('Error al consultar datos:', error);
            res.status(500).send('Error al consultar datos');
        }

    })

    // Consultar las transacciones por id
    app.get('/base-datos/consultar-transacciones/:id', async (req, res) => {

        let id = req.params.id;
        console.log("Consulta de transacción por id:", id);

        try {
            let response = await getDataById(id);
            res.status(200).json(response);
        } catch (error) {
            console.error('Error al consultar datos por id:', error);
            res.status(500).send('Error al consultar datos por id');
        }

    })

    // Actualizar una transaccion por id:
    app.put('/base-datos/actualizar-transaccion/:id', async (req, res) => {

        let id = req.params.id;
        let data = req.body;

        console.log("BANDERA 11 req.body:", data, " & ", id);

        try {
            let response = await updateData(id, data);
            res.status(200).json(response);
        } catch (error) {
            console.error('Error al actualizar datos de transacción por id:', error);
            res.status(500).send('Error al actualizar datos de transacción por id');
        }

    })

    // Ruta para eliminar  datos usando un  id
    app.delete('/base-datos/eliminar-transaccion/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let response = await deleteData(id); // Llamada a la función de eliminar
        console.log("bandera 15 :mensaje borrado correctamente")
        res.json(response);
    } catch (error) {
        console.error('Error al eliminar datos de la transacción:', error);
        res.status(500).send('Error al eliminar la transacción');
       }
    });

   
    app.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });
}



export default main;
