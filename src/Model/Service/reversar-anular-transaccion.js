import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

async function refundTransaccion(token, amount) {
    try {
        // Inicializa una transacción para solicitar una reversa o anulación del pago
        const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
        const response = await tx.refund(token, amount);

        // Verifica si la transacción fue anulada exitosamente
        if (response) {
            console.log('Transacción anulada exitosamente');
        } else {
            console.log('Error al anular la transacción');
        }

        return response; // Devuelve la respuesta de la transacción

    } catch (error) {
        console.error('Error al anular transacción:', error);
        throw error; // Lanza el error para manejo externo
    }
}

export default refundTransaccion;
