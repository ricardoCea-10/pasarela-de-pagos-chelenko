import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

const buyOrder = `orden_${Date.now()}`; // Crear un identificador único
const sessionId = `sesion_${Date.now()}`;
const amount = 1000; // Este es el monto que estás cobrando
const returnUrl = "http://localhost:3000/retorno-pago"; // Esta es la URL a la que redirige Transbank después del pago

async function createTransaction() {
    const tx = new WebpayPlus.Transaction(
        new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
    );
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

    const tokenWs = response.token;
    const formAction = response.url;

    return { amount, buyOrder, tokenWs, formAction };
}

export default createTransaction;
