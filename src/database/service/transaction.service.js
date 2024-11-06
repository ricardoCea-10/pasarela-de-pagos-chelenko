import Transaction from "../model/transaction.model.js"

// Capturar datos y enviarlos a la base de datos antes de continuar
async function newTransactionDB(guest, buyOrder, sessionId, amount) {

    try {
        const newTransaction = await Transaction.create({
            guest: guest,
            buyOrder: buyOrder,
            sessionId: sessionId,
            amount: amount
        })
        await newTransaction.save();
        console.log("BANDERA 31. nueva transacción en BD ATLAS: ", newTransaction);

    } catch (error) {
        console.error('Error al crear la transacción en BD Atlas:', error);
        throw error;
        
    }
    

}

async function getTransactionDBFindOne(sessionId) {

    try {
        const data = await Transaction.findOne({sessionId : sessionId});
        return data;
    } catch (error) {
        console.error('Error al buscar la transacción en BD Atlas:', error);
        throw error;
    }

   
}

async function getTransactionDBFindByIdAndUpdate (id, transactionDataAtlas){

    try {
        const getTransaction = await Transaction.findByIdAndUpdate(id, transactionDataAtlas, {new: true});
        await getTransaction.save();
        console.log("BANDERA 32. getTransactionDBFindByIdAndUpdate: ", getTransaction);
        return getTransaction;
    } catch (error) {
        console.error('Error al actualizar la transacción en BD Atlas:', error);
        throw error; 
    }
}

export {newTransactionDB, getTransactionDBFindOne, getTransactionDBFindByIdAndUpdate};
