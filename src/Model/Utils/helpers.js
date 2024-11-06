
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

// Función para almacenar la estroctura de la data:
function structureData(sessionId, confirmation) {
    
    let transactionData = {
        guest : sessionId,
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
        balance : confirmation.balance
        
    };
    return transactionData;
}

export {checkTransactionStatusCode, structureData};

