import 'dotenv/config'; // Importa y configura dotenv sin usar require
import express from 'express';
import morgan from 'morgan';
import createTransaction, { amount as monto } from '../Model/Service/crear-transaccion.js'; // Importar función crear transaccion
import confirmTransaction from '../Model/Service/confirmar-transaccion.js'; // Importar función confirmar transaccion
import checkTransaccion from '../Model/Service/estado-transaccion.js'; // Importar la función de consulta de transacción
import refundTransaccion from '../Model/Service/reversar-anular-transaccion.js';  // Importar la función de anular transacción
import {getData, getDataReservationById, postData, getDataById, updateData, deleteData} from '../Model/Repository/data.js';
import {checkTransactionStatusCode} from '../Model/Utils/helpers.js';
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
    app.post('/iniciar-pago', async (req, res) => {
        try {
            
            // Obtenemos datos desde formulario | sessionId debe ser igual a idGuesT
            let buyOrder = req.body.buyOrder;
            let sessionId = req.body.sessionId;
            let amount = req.body.amount; 
            let returnUrl = req.body.returnUrl;
            let idGuesT = req.body.IdGuesT
            
            // Llamamos a la función crear transacción
            console.log("Datos recibidos del formulario: BuyOrder:", buyOrder, "| sessionId:", sessionId, "| amount:", amount, "| returnUrl:", returnUrl, "| IdGuest:", idGuesT);
            let response = await createTransaction(buyOrder, sessionId, amount, returnUrl);

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
    app.all('/retorno', async (req, res) => {

        // Obtener parámetros del cuerpo o query, según el método
        let tokenWs2 = req.body.token_ws || req.query.token_ws;
        let tbkToken = req.body.TBK_TOKEN || req.query.TBK_TOKEN;
        let tbkOrdenCompra = req.body.TBK_ORDEN_COMPRA || req.query.TBK_ORDEN_COMPRA;
        let tbkIdSesion = req.body.TBK_ID_SESION || req.query.TBK_ID_SESION;

        // Creamos objeto con la posible data de Transbank:
        let dataTransbank = {
            token_ws: tokenWs2,
            TBK_TOKEN: tbkToken,
            TBK_ORDEN_COMPRA: tbkOrdenCompra,
            TBK_ID_SESION: tbkIdSesion
        }

        // Mostrar los posibles datos recibidos para depuración
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
                let confirmation = await confirmTransaction(tokenWs2);
                console.log('Transacción correcta. El pago ha sido aprobado o rechazado.');

                // Recuperamos sessionId:
                let sessionId = confirmation.session_id;

                // Recuperar id de reserva de la base de datos, este debe coincidir con el sessionId:
                let idGuesTDBAux = await getDataReservationById(sessionId);
                let idGuesTDB = idGuesTDBAux._id;
                console.log("");
                console.log("BANDERA 20. sessionId (original Transbank):", sessionId);
                console.log("BANDERA 21. idGuesTDB (base datos):", idGuesTDB);
                console.log("");
                
                // generamos objeto con datos de respuesta
                let responseConfirmTransaction = {
                    guest : sessionId,
                    vci : confirmation.vci,
                    amount : confirmation.amount,
                    status : confirmation.status,
                    buyOrder : confirmation.buy_order,
                    sessionId : confirmation.session_id,
                    cardDetail: {
                        cardNumber: confirmation.card_detail.card_number, // Campo actualizado
                      },
                    accountingDate : confirmation.accounting_date,
                    transactionDate : confirmation.transaction_date,
                    autorizationCode : confirmation.authorization_code, // Campo con error ortográfico
                    paymentTypeCode : confirmation.payment_type_code,
                    responseCode : confirmation.response_code,
                    installmentsAmount : confirmation.installments_amount,
                    installmentsNumber : confirmation.installments_number,
                    balance : confirmation.balance
                }

                // Enviamos objeto responseConfirmTransaction a base de datos:
                const data = await postData(responseConfirmTransaction);

                let statusCode = checkTransactionStatusCode(confirmation.response_code, confirmation.payment_type_code);
                console.log(statusCode);
                res.status(200).json(responseConfirmTransaction);
            }
            // Si existe TBK_TOKEN, TBK_ORDEN_COMPRA y TBK_ID_SESION, el pago fue abortado
            else if (tbkToken && tbkOrdenCompra && tbkIdSesion) {

                console.log('Transacción abortada.');

                // Checkeamos el estado de la Transacción abortada:
                let estadoTransaccion = await checkTransaccion(tbkToken);
                console.log("Estado de la transacción abortada:", estadoTransaccion);
                res.status(200).send('Transacción abortada.');
                //res.redirect('/pago-rechazado');
            }
            // Si existe TBK_ORDEN_COMPRA y TBK_ID_SESION, la transacción ha excedido el tiempo (timeout)
            else if (tbkOrdenCompra && tbkIdSesion) {

                console.log('Transacción abortada por timeout.');                
                res.status(200).send('Transacción abortada por timeout.');
                //res.redirect('/pago-rechazado');
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

    // Ruta para mostrar la pantalla de pago rechazado
    app.get('/pago-rechazado', (req, res) => {
        res.sendFile(path.join(__dirname, '../views', 'pago-rechazado.html'));  
    });
    
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
