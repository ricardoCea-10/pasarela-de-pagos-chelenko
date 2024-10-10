const prompt = require('prompt-sync')() 
/*
const WebpayPlus = require("transbank-sdk").WebpayPlus; // CommonJS | Llamamos al SDK
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require("transbank-sdk"); // CommonJS
*/
import { WebpayPlus } from 'transbank-sdk'; // ES6 Modules
import { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk'; // ES6 Modules


// Crear una transacción | Versión 3.x del SDK:
const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
const response = await tx.create(buyOrder, sessionId, amount, returnUrl); // identificador unico orden, id sesion, monto transacción, url de retrono luego del pago.

// Respuesta a crear una transacción:
response.url        // enviamos formulario POST con info del token
response.token      // token

// Confirmar una transacción | Versión 3.x del SDK:
tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
response = await tx.commit(token);

// Respuesta Confirmar una transacción:
response.vci
response.amount
response.status
response.buy_order
response.session_id
response.card_detail
response.accounting_date
response.transaction_date
response.authorization_code
response.payment_type_code
response.response_code
response.installments_amount
response.installments_number
response.balance

// Obtener estado de una transacción | Versión 3.x del SDK:
tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
response = await tx.status(token);

// Respuesta estado de una transacción:
/*
response.vci
response.amount
response.status
response.buy_order
response.session_id
response.card_detail
response.accounting_date
response.transaction_date
response.authorization_code
response.payment_type_code
response.response_code
response.installments_amount
response.installments_number
response.balance
*/

// Reversar o Anular una transacción | Versión 3.x del SDK:
tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
response = await tx.refund(token, amount);

// Respuesta Reversa o Anulación:
response.authorization_code
response.authorization_date
response.balance
response.nullified_amount
response.response_code
response.type



/*
const prompt = require('prompt-sync')();
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require('transbank-sdk'); // CommonJS

async function main() {
    // Definir los parámetros necesarios para la transacción:
    const buyOrder = "orden12345"; // Identificador único de la orden
    const sessionId = "sesion12345"; // Identificador de la sesión
    const amount = 1000; // Monto de la transacción
    const returnUrl = "https://mi-sitio.cl/webpay/return"; // URL de retorno luego del pago
    
    try {
        // Crear una transacción
        const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
        let response = await tx.create(buyOrder, sessionId, amount, returnUrl);
        
        console.log("URL de pago:", response.url);
        console.log("Token de transacción:", response.token);

        // Confirmar la transacción con el token
        response = await tx.commit(response.token);

        console.log("Confirmación de pago:", response);

        // Obtener el estado de la transacción
        response = await tx.status(response.token);
        console.log("Estado de la transacción:", response);

        // Reversar o anular la transacción si es necesario
        response = await tx.refund(response.token, amount);
        console.log("Reversa de transacción:", response);

    } catch (error) {
        console.error("Error en la transacción:", error);
    }
}

main(); // Ejecutar la función asíncrona
*/
