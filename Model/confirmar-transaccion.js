import pkg from 'transbank-sdk'; // Transbanck | ES6 Modules
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;



async function confirmTransaction() {

    // Token de respuesta transbank para pruebas
    const token = '01ab6d78fd8ced6825370edb87c90ef7a8e299f58961aa5f3e63772cba20ff53';

    // Confirmar una transacción | Versión 3.x del SDK:
    const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
    const response = await tx.commit(token);

    console.log("Respuesta 2: ", response);

}

export default confirmTransaction;