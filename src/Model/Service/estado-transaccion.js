import pkg from 'transbank-sdk'; // Importa el SDK de Transbank
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg; // Desestructura los componentes necesarios

// const token = 'TOKEN_DE_LA_TRANSACCION'; // Reemplaza con un token válido

async function consultarTransaccion(token) {
    try {
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
    } catch (error) {
        console.error('Error al consultar la transacción:', error);
    }
}

export default consultarTransaccion;

// consultarTransaccion(); // Llama a la función para ejecutar la consulta
