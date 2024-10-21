import pkg from 'transbank-sdk'; // Transbanck | ES6 Modules
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;



async function confirmTransaction(theTokenWS2) {

    // Token de respuesta transbank para pruebas
    // const token = '01ab6d78fd8ced6825370edb87c90ef7a8e299f58961aa5f3e63772cba20ff53';

    // Confirmar una transacción | Versión 3.x del SDK:
    const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
    const response = await tx.commit(theTokenWS2);

    console.log("Respuesta 2: ", response); // mostramos datos por consola
    
    // si la respuesta es exitosa (aprobada):
    if (response.response_code == 0) {
        // Guardamos datos en constantes
        // código: redireccionar usuario a url WebPay
        const tokenWs2 = theTokenWS2;
        const responseCode = response.response_code;
        const amount = response.amount;
        const autorizationCode = response.authorization_code;
        
        const theResponse2 = { tokenWs2, responseCode, amount, autorizationCode }; // creamos objeto
        console.log("respuesta 2.1: Transacción aprobada: ", theResponse2);

        return theResponse2;

    } else {
        // lógica en caso de transacción fallida
        console.log("Error en la transacción");
        return null;
    }
}


export default confirmTransaction;