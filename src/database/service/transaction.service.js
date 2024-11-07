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

        if(newTransaction !== undefined) {
            console.log('');
            console.log('Transacción creada en BD Atlas (datos iniciales)');
            console.log('');
        } else {
            console.log('');
            console.log('Error al crear la transacción en BD Atlas (datos iniciales)');
            console.log('');
        }

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
        console.error('Error al buscar la transacción en BD Mongo Atlas:', error);
        throw error;
    }

   
}

async function getTransactionDBFindByIdAndUpdate (id, transactionDataAtlas){

    try {
        const getTransaction = await Transaction.findByIdAndUpdate(id, transactionDataAtlas, {new: true});
        await getTransaction.save();

        if(getTransaction !== undefined) {
            console.log('');
            console.log('Transacción correctamente actualizada en BD Mongo Atlas');
        } else {
            console.log('');
            console.log('Error al actualizar la transacción en BD Mongo Atlas');
        }

        return getTransaction;
    } catch (error) {
        console.error('Error al actualizar la transacción en BD Atlas:', error);
        throw error; 
    }
}

export {newTransactionDB, getTransactionDBFindOne, getTransactionDBFindByIdAndUpdate};
