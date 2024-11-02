import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;

async function confirmTransaction(token2) {
    try {
        // metodo de Transback para confirmar transacción (usamos SDK):
        const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
        const response = await tx.commit(token2);
        let token2Accion = token2;

        // Imprimo el 2do token por consola
        console.log("2DO TOKEN: ", token2Accion);

        if (response.response_code === 0) {
            console.log("Transacción confirmada desde Transbank:", response);
        } else {
            console.log("Error en la confirmación de la transacción desde Transbank", response);
        }

        return response;
        
    } catch (error) {
        console.error("Error al confirmar la transacción:", error);
    }
}

export default confirmTransaction;
