import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

async function confirmTransaction(token) {
    const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
    const response = await tx.commit(token);

    if (response.response_code === 0) {
        console.log("Transacción aprobada:", response);
        return response;
    } else {
        console.log("Error en la transacción");
        return null;
    }
}

export default confirmTransaction;
