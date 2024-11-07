
// Función que verifica el estado de una transaccion de acuerdo a su numero de respuesta:
// Transacción aprovada === 0
function checkTransactionStatusCode(numeroRespuesta, tipoDePago) {
    let formaAbono;
    if (numeroRespuesta === 0) {
        switch (tipoDePago) {
            case 'VD':
                formaAbono = 'Débito';
                break;
            case 'VN':
                formaAbono = 'Crédito (Venta Normal)';
                break;
            case 'VC':
                formaAbono = 'Crédito (Venta en Cuotas)';
                break;
            case 'SI':
                formaAbono = 'Crédito (Cuotas Sin Interés)';
                break;
            case 'S2':
                formaAbono = 'Crédito (2 Cuotas Sin Interés)';
                break;
            case 'NC':
                formaAbono = 'Crédito (N Cuotas)';
                break;
            default:
                formaAbono = 'Desconocido';
        }

        return `El pago ha sido aprobado. Forma de abono: ${formaAbono}`
        /*
        res.render('pago-aprobado', {
            titular: 'Nombre del titular', // Aquí deberías reemplazar con el valor real si está disponible
            tarjeta: confirmation.card_detail.card_number,
            monto: confirmation.amount,
            forma_abono: formaAbono, // Forma de abono interpretada
            fecha_hora: confirmation.transaction_date,
            codigo_transaccion: confirmation.buy_order,
            codigo_autorizacion: confirmation.authorization_code
        });
        */
    } else {
        return `El pago ha sido rechazado`
       // res.redirect('/pago-rechazado');
    }
}

// Función para almacenar la estructura de la data que irá posteriormente a la base datos api:
function structureData(guest, confirmation, token) {
    
    let transactionData = {
        guest : guest,
        vci : confirmation.vci,
        amount : confirmation.amount,
        status : confirmation.status,
        buyOrder : confirmation.buy_order,
        sessionId : confirmation.session_id,
        cardDetail: {
            cardNumber: confirmation.card_detail.card_number, // Campo actualizado
            },
        accountingDate : confirmation.accounting_date,
        transactionDate : confirmation.transaction_date,
        autorizationCode : confirmation.authorization_code, // Campo con error ortográfico
        paymentTypeCode : confirmation.payment_type_code,
        responseCode : confirmation.response_code,
        installmentsAmount : confirmation.installments_amount,
        installmentsNumber : confirmation.installments_number,
        balance : confirmation.balance,
        tokenWs : token,
        TbkToken : ""
        
    };
    return transactionData;
}

// Función para almacenar la estructura de la data abortada que irá posteriormente a la base datos api:
function structureDataAbort(guest, response, token){

    let transactionDataAbort = {
        guest : guest,
        vci : "aborted",
        amount : response.amount,
        status : response.status,
        buyOrder : response.buy_order,
        sessionId : response.session_id,
        cardDetail: {
            cardNumber: "0000", 
            },
        accountingDate : response.accounting_date,
        transactionDate : response.transaction_date,
        autorizationCode : "0", // Campo con error ortográfico
        paymentTypeCode : "VN",
        responseCode : -3,
        installmentsAmount : 0,
        installmentsNumber : response.installments_number,
        balance : 0,
        tokenWs : "",
        TbkToken : token
    };
    return transactionDataAbort;
}

// Función para almacenar la estructura de la data abortada por timeout, que irá posteriormente a la base datos api:
function structureDataTimeOut(guest, sessionId, buyOrder){

    let transactionDataTimeOut = {
        guest : guest,
        vci : "Timeout",
        amount : 0,
        status : "NULLIFIED",
        buyOrder : buyOrder,
        sessionId : sessionId,
        cardDetail: {
            cardNumber: "0000", 
            },
        accountingDate : "0000",
        transactionDate : "0000",
        autorizationCode : "0", // Campo con error ortográfico
        paymentTypeCode : "VN",
        responseCode : -3,
        installmentsAmount : 0,
        installmentsNumber : 0,
        balance : 0
    };
    return transactionDataTimeOut;
}

// Función para almacenar la estructura de la data que irá posteriormente a la base datos Mongo Atlas:
function structureDataAtlas(confirmation, token){

    let transactionDataAtlas = {
        vci : confirmation.vci,
        status : confirmation.status,
        cardDetail: {
            cardNumber: confirmation.card_detail.card_number, // Campo actualizado
            },
        accountingDate : confirmation.accounting_date,
        transactionDate : confirmation.transaction_date,
        autorizationCode : confirmation.authorization_code, // Campo con error ortográfico
        paymentTypeCode : confirmation.payment_type_code,
        responseCode : confirmation.response_code,
        installmentsAmount : confirmation.installments_amount,
        installmentsNumber : confirmation.installments_number,
        balance : confirmation.balance,
        tokenWs : token
    };

    return transactionDataAtlas;
}

// Función para almacenar la estructura de la data abortada que irá posteriormente a la base datos Mongo Atlas:
function structureDataAtlasAbort(response, token){

    let transactionDataAtlasAbort = {
        status : response.status,
        accountingDate : response.accounting_date,
        transactionDate : response.transaction_date,
        installmentsNumber : response.installments_number,
        tokenWs : token,
        message : "Aborted"
    };

    return transactionDataAtlasAbort;
}

// Función para almacenar la estructura de la data abortada por TimeOut que irá posteriormente a la base datos Mongo Atlas:
function structureDataAtlasTimeOut(){

    let transactionDataAtlasAbort = {
        message : "Timeout"
    };

    return transactionDataAtlasAbort;
}

export {checkTransactionStatusCode, structureDataAbort, structureDataTimeOut, structureData, structureDataAtlas, structureDataAtlasAbort, structureDataAtlasTimeOut};

