// Importar el paquete Transbank SDK y las clases necesarias
import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

let amount;

// Función asíncrona para crear una transacción en Webpay Plus
async function createTransaction(buyOrder, sessionId, amount, returnUrl) {
    try {
        /* 
        * Inicializa una nueva instancia de transacción en Webpay Plus usando el entorno de integración
        * y configurando el código de comercio y la clave de API para realizar la transacción.
        * Se puede cambiar a `Environment.Production` para el entorno de producción.
        */

        const tx = new WebpayPlus.Transaction(
            new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
        );
        /* 
        * Realiza la creación de la transacción, pasando el número de orden, la sesión, el monto
        * y la URL de retorno. La respuesta incluye el token para el proceso de pago y la URL 
        * a la que se debe redirigir el formulario de pago.
        */
        const response = await tx.create(buyOrder, sessionId, amount, returnUrl);
        
        // Extraer el token y la URL para el formulario de pago, y retornarlos junto con el monto y la orden
        let tokenWs = response.token;
        const formAction = response.url;
    
        console.log("");
        console.log("Datos de la creación de la transaccion:");
        console.log("amount:", amount);
        console.log("buyOrder:", buyOrder);
        console.log("tokenWs:", tokenWs);
        console.log("formAction:", formAction);
        console.log("");
    
        return { tokenWs, formAction };
        
    } catch (error) {
        console.error("Error al crear la transacción:", error);
    }
}

export default createTransaction;
export { amount }; // Exporta "amount" directamente