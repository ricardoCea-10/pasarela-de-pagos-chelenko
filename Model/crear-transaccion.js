
import pkg from 'transbank-sdk'; // Transbanck | ES6 Modules
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

// Datos de ejemplo para la creación de una transacción
let buyOrder = "orden123"; // Ejemplo de buyOrder
let sessionId = "123"; // Ejemplo de sessionId
let amount = 1000000; // Ejemplo de monto
let returnUrl = "http://tu-url-de-retorno.com"; // URL de retorno (una vez hecho el pago en transback)
let finalUrl = "http://tu-url-final.com" // URL (para algo...)

async function createTransaction() {
    // Crear una transacción | Versión 3.x del SDK:
    const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)); 
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl); // identificador único orden, id sesión, monto transacción, url de retorno después del pago.

    // Almacenamos objeto en constantes
    const tokenWs = response.token;
    const formAction = response.url; // esta url va en el boton de "ir a pagar" (para redireccionar a transbanck)

    // creamos un objeto con las constantes amount, buyOrder tokenWs y formAction
    const theResponse = { amount, buyOrder, tokenWs, formAction };
    console.log("respuesta 1: ", theResponse);

    return theResponse;
}

export default createTransaction;