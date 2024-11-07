import pkg from 'transbank-sdk'; // Importa el SDK de Transbank
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg; // Desestructura los componentes necesarios

async function checkTransaccion(token) {
    try {
        // Crea una instancia de la transacción
        const tx = new WebpayPlus.Transaction(
            new Options(
                IntegrationCommerceCodes.WEBPAY_PLUS,
                IntegrationApiKeys.WEBPAY,
                Environment.Integration
            )
        );

        // Consulta el estado de la transacción
        const response = await tx.status(token);
        return response; // Devuelve la respuesta de la transacción

    } catch (error) {
        console.error('Error al consultar la transacción:', error);
        throw error; // Lanza el error para manejo posterior
    }
}

export default checkTransaccion;
