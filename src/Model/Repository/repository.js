
import mongoose from 'mongoose';
 
// Definir el esquema para la transacción
const transactionSchema = new mongoose.Schema({
    idGuesT: String,
    messageInfo: String,
    tokenWs2: String,
    vci: String,
    amount: Number,
    status: String,
    buyOrder: String,
    sessionId: String,
    cardDetail: {
        card_number: String
    },
    accountingDate: String,
    transactionDate: String,
    authorizationCode: String,
    paymentTypeCode: String,
    responseCode: Number
});
 
// Crear el modelo de la transacción
const Transaction = mongoose.model('Transaction', transactionSchema);
 
export default Transaction;
