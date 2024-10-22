import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;
import express from 'express';
import morgan from 'morgan';
import createTransaction from '../Model/crear-transaccion.js';
import confirmTransaction from '../Model/confirmar-transaccion.js';
import { fileURLToPath } from 'url';  // Importar `fileURLToPath` desde `url` para manejar ES Modules
import { dirname } from 'path';        // Importar `dirname` desde `path` para obtener el directorio

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

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');

    // Ruta para la página inicial con el botón de pago
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/views/form.html');
    });

    // Ruta para crear la transacción con Transbank
    app.post('/iniciar-pago', async (req, res) => {
        try {
            const response = await createTransaction();
            // Redirige al usuario a la página de pago de Webpay
            res.redirect(`${response.formAction}?token_ws=${response.tokenWs}`);
        } catch (error) {
            console.error('Error al crear la transacción:', error);
            res.status(500).send('Error al iniciar la transacción');
        }
    });

    // Ruta para manejar el retorno de Transbank
    app.all('/retorno', async (req, res) => {
        const tokenWs2 = req.method === 'POST' ? req.body.token_ws : req.query.token_ws;
        const tbkToken = req.method === 'POST' ? req.body.TBK_TOKEN : req.query.TBK_TOKEN;
        const tbkOrdenCompra = req.method === 'POST' ? req.body.TBK_ORDEN_COMPRA : req.query.TBK_ORDEN_COMPRA;
        const tbkIdSesion = req.method === 'POST' ? req.body.TBK_ID_SESION : req.query.TBK_ID_SESION;
        
        // mostramos token_ws, TBK_TOKEN, TBK_ORDEN_COMPRA y TBK_ID_SESION por consola
        console.log("");
        console.log("Mostramos datos recibidos por Transbank");
        console.log('token_ws:', tokenWs2);
        console.log('TBK_TOKEN:', tbkToken);
        console.log('TBK_ORDEN_COMPRA:', tbkOrdenCompra);
        console.log('TBK_ID_SESION:', tbkIdSesion);


        if (!tokenWs2) {
            res.redirect('/pago-rechazado');
            return;
        }
    
        try {
            const confirmation = await confirmTransaction(tokenWs2);
            if (confirmation && confirmation.response_code === 0) {
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
                res.render('pago-aprobado', {
                    titular: 'Nombre del titular', // Aquí deberías reemplazar con el valor real si está disponible
                    tarjeta: confirmation.card_detail.card_number,
                    monto: confirmation.amount,
                    forma_abono: formaAbono, // Forma de abono interpretada
                    fecha_hora: confirmation.transaction_date,
                    codigo_transaccion: confirmation.buy_order,
                    codigo_autorizacion: confirmation.authorization_code
                });
            } else {
                res.redirect('/pago-rechazado');
            }
        } catch (error) {
            console.error('Error al confirmar la transacción:', error);
            res.status(500).send('Error al procesar el pago');
        }
    });


/*    
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
*/

    // Ruta para mostrar la pantalla de pago rechazado
    app.get('/pago-rechazado', (req, res) => {
        res.sendFile(__dirname + '/views/pago-rechazado.html');
    });

    app.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });
}

export default main;
