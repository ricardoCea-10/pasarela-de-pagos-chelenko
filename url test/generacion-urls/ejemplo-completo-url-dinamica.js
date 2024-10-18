/*Ejemplo Completo: Generar la URL de Retorno Dinámicamente en Express
Cuando estás generando una transacción con Transbank (en tu archivo crear-transaccion.js), puedes generar la URL de retorno de manera dinámica. 

Explicación del Código
Obtener Datos de la Transacción:

Se reciben amount y sessionId del cuerpo de la solicitud. Estos son los datos que definen cuánto se debe cobrar y a quién pertenece la sesión.
Generar buyOrder Dinámicamente:

buyOrder se define utilizando Date.now() para garantizar que sea único cada vez que se realiza una nueva compra. Esto ayuda a evitar conflictos y asegurar que cada transacción tenga un identificador distinto.
Definir la URL de Retorno (returnUrl) Según el Entorno:

Dependiendo del entorno (development o production), la URL base cambiará. En desarrollo, se usa http://localhost:3000, mientras que en producción, se usa https://miaplicacion.com.
Esto se concatena con /retorno-pago para crear la URL completa de retorno.
Crear la Transacción con el SDK de Transbank:

Se crea una nueva transacción utilizando la clase WebpayPlus.Transaction y se pasa la buyOrder, el sessionId, el amount y la returnUrl.
Enviar la Respuesta al Cliente:

Después de crear la transacción, se devuelve al cliente la urlPago y el tokenWs para que el cliente pueda continuar con el proceso de pago.*/

import express from 'express';
import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';

const app = express();
const port = 3000;

app.post('/crear-transaccion', async (req, res) => {
    try {
        // Datos de la transacción proporcionados por el cliente
        let { amount, sessionId } = req.body;

        // Definir el ID de la orden de compra
        let buyOrder = "orden_" + Date.now(); // Generar un identificador único para la compra

        // Generar la URL de retorno según el entorno
        let environment = process.env.NODE_ENV || "development"; // Definir el entorno
        let baseUrl = environment === "development" ? "http://localhost:3000" : "https://miaplicacion.com";
        let returnUrl = `${baseUrl}/retorno-pago`;

        // Crear la transacción con Transbank
        const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
        const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

        // Enviar respuesta al cliente
        res.json({
            urlPago: response.url,
            tokenWs: response.token
        });
    } catch (error) {
        console.error('Error al crear la transacción:', error);
        res.status(500).send('Error al procesar la transacción');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
