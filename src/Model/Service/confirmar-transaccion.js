import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

async function confirmTransaction(token2) {
    try {
        // Inicializa una transacción para confirmar el pago usando el SDK de Transbank
        const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
        const response = await tx.commit(token2);

        return response;
        
    } catch (error) {
        console.error("Error al confirmar la transacción:", error);
        throw error;
    }
}

export default confirmTransaction;
