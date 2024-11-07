// Importar el paquete Transbank SDK y las clases necesarias
import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

let amount;

// Función asíncrona para crear una transacción en Webpay Plus
async function createTransaction(buyOrder, sessionId, amount, returnUrl) {
    try {
        // Inicializa una nueva instancia de transacción en Webpay Plus
        const tx = new WebpayPlus.Transaction(
            new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
        );

        // Crea la transacción y obtiene el token y la URL de pago
        const response = await tx.create(buyOrder, sessionId, amount, returnUrl);
        
        let tokenWs = response.token;
        const formAction = response.url;
    
        return { tokenWs, formAction };
        
    } catch (error) {
        console.error("Error al crear la transacción:", error);
        throw error;
    }
}

export default createTransaction;
export { amount }; // Exporta "amount" directamente
