import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

// Confirma una transacción en Webpay Plus utilizando un token proporcionado.
 
async function confirmTransaction(token) {
    /* 
     * Inicializamos una nueva instancia de transacción de Webpay Plus en el entorno de integración,
     * configurando el código de comercio y la clave de API de Webpay. 
     * Cambia `Environment.Integration` a `Environment.Production` para el entorno de producción.
     */
    const tx = new WebpayPlus.Transaction(new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
    ));

    /* 
     * Realizamos la confirmación de la transacción utilizando el token.
     * Luego verificamos el código de respuesta (response_code) para determinar si la transacción fue aprobada.
     * Una transacción es aprobada si el código de respuesta es 0, en cuyo caso mostramos y retornamos la respuesta.
     * Si no, retornamos null indicando error.
     */
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
