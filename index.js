
import prompt from 'prompt-sync';
import pkg from 'transbank-sdk'; // ES6 Modules
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

const buyOrder = "orden123"; // Ejemplo de buyOrder
const sessionId = "123"; // Ejemplo de sessionId
const amount = 1000; // Ejemplo de monto
const returnUrl = "http://tu-url-de-retorno.com"; // URL de retorno

async function crearTransaccion() {
    // Crear una transacción | Versión 3.x del SDK:
    const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)); 
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl); // identificador único orden, id sesión, monto transacción, url de retorno después del pago.

    console.log("respuesta:", response);
    console.log("hola mundo");
}

crearTransaccion().catch(console.error);