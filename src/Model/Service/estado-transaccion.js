import pkg from 'transbank-sdk'; // Importa el SDK de Transbank
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg; // Desestructura los componentes necesarios


async function consultarTransaccion(token) {
    try {
        console.log('Consultando transacción con token:', token);
        // Crea una nueva instancia de la transacción con las opciones requeridas
        const tx = new WebpayPlus.Transaction(
            new Options(
                IntegrationCommerceCodes.WEBPAY_PLUS, // Código de comercio para Webpay Plus
                IntegrationApiKeys.WEBPAY,           // Clave de API para Webpay
                Environment.Integration               // Entorno de integración
            )
        );

        // Consulta el estado de la transacción utilizando el token
        const response = await tx.status(token);
        console.log('Estado de la transacción:', response);
        return response; // Devuelve la respuesta de la transacción

    } catch (error) {
        console.error('Error al consultar la transacción:', error);
        throw error; // Lanza el error para que pueda ser manejado por el código que llama a esta función
    }
}

export default consultarTransaccion;
