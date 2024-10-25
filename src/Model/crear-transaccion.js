import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

const buyOrder = `orden_${Date.now()}`; // Crear un identificador único
const sessionId = `sesion_${Date.now()}`;
const amount = 9999; // Este es el monto que estás cobrando
const returnUrl = "http://localhost:3000/retorno"; // Esta es la URL a la que redirige Transbank después del pago

async function createTransaction() {
    const tx = new WebpayPlus.Transaction(
        new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
    );
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

    const tokenWs = response.token;
    const formAction = response.url;

    console.log("");
    console.log("Datos de la creación de la transaccion:");
    console.log("amount:", amount);
    console.log("buyOrder:", buyOrder);
    console.log("tokenWs:", tokenWs);
    console.log("formAction:", formAction);
    console.log("");

    return { amount, buyOrder, tokenWs, formAction };
}

export default createTransaction;
export { amount }; // Exporta "amount" directamente