import pkg from 'transbank-sdk'; // Importa el SDK de Transbank
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg; // Desestructura los componentes necesarios


async function refundTransaccion(token, amount) {
    try {

        // Accedemos al SDK de Tansbank para solicitar una reversa o anulacion del pago
        const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
        const response = await tx.refund(token, amount);

        if (response) {
            console.log('Transacción anulada exitosamente:', response);
        } else {
            console.log('Error al anular la transacción');
        }
        
        return response; // Devuelve la respuesta de la transacción

    } catch (error) {

        console.error('Error al anular transacción:', error);
        throw error; // Lanza el error para que pueda ser manejado por el código que llama a esta función
    }
}

export default refundTransaccion;