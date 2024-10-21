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
    app.all('/retorno-pago', async (req, res) => {
        const tokenWs2 = req.method === 'POST' ? req.body.token_ws : req.query.token_ws;

        console.log('Token de la transacción:', tokenWs2);

        if (!tokenWs2) {
            res.redirect('/pago-rechazado');
            return;
        }

        try {
            const confirmation = await confirmTransaction(tokenWs2);
            if (confirmation) {
                res.sendFile(__dirname + '/views/pago-aprobado.html');
            } else {
                res.redirect('/pago-rechazado');
            }
        } catch (error) {
            console.error('Error al confirmar la transacción:', error);
            res.status(500).send('Error al procesar el pago');
        }
    });

    // Ruta para mostrar la pantalla de pago rechazado
    app.get('/pago-rechazado', (req, res) => {
        res.sendFile(__dirname + '/views/pago-rechazado.html');
    });

    app.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });
}

export default main;
