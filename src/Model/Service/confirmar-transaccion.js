import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

async function confirmTransaction(token2) {
    try {
        // Inicializa una transacción para confirmar el pago usando el SDK de Transbank
        const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
        const response = await tx.commit(token2);

        // Muestra el token de la transacción en consola
        console.log("2DO TOKEN: ", token2);

        // Verifica el resultado de la transacción
        if (response.response_code === 0) {
            console.log("Transacción confirmada:", response);
        } else {
            console.log("Transacción rechazada:", response);
        }

        return response;
        
    } catch (error) {
        console.error("Error al confirmar la transacción:", error);
    }
}

export default confirmTransaction;
