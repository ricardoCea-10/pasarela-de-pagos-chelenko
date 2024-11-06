import Transaction from "../model/transaction.model.js"

// Capturar datos y enviarlos a la base de datos antes de continuar
async function newTransactionDB(guest, buyOrder, sessionId, amount) {

    const newTransaction = await Transaction.create({
        guest: guest,
        buyOrder: buyOrder,
        sessionId: sessionId,
        amount: amount
    })
    
    await newTransaction.save();
    
    console.log("BANDERA 31. nueva transacción en BD: ", newTransaction);

}

export {newTransactionDB};
