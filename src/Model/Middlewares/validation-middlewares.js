// Creamos middleware de validacion de datos del cliente:
const validateDataClient = (req, res, next) => {

    try {
        // Obtenemos datos desde formulario | sessionId debe ser igual a idGuesT
        req.buyOrder = req.body.buyOrder;
        req.sessionId = req.body.sessionId;
        req.amount = req.body.amount; 
        req.returnUrl = req.body.returnUrl;
        req.guest = req.body.guest

        if (!req.buyOrder || !req.sessionId || !req.amount || !req.returnUrl || !req.guest) {
            console.log('Faltan datos en el formulario');
            return res.status(400).send('Faltan datos en el formulario');
        } else {
            
            next();
        }

    } catch (error) {

        console.error('Error al validar datos del cliente:', error);
        res.status(500).send('Error al validar datos del cliente. Por favor, intente más tarde.'); 
    }
};


// Creamos middleware de validacion de datos de retorno Transbank:
const validateDataClientTransbank = (req, res, next) => {

    try {
        // Obtener parámetros del cuerpo o query, según el método
        req.tokenWs2 = req.body.token_ws || req.query.token_ws;
        req.tbkToken = req.body.TBK_TOKEN || req.query.TBK_TOKEN;
        req.tbkOrdenCompra = req.body.TBK_ORDEN_COMPRA || req.query.TBK_ORDEN_COMPRA;
        req.tbkIdSesion = req.body.TBK_ID_SESION || req.query.TBK_ID_SESION;

        if (!req.tokenWs2 && !req.tbkToken && !req.tbkOrdenCompra && !req.tbkIdSesion) {
            console.log('No se encontraron parámetros de respuesta de Transbank | Problemas en la redirección de regreso desde Transbank');
            return res.status(400).send('No se encontraron parámetros de respuesta de Transbank. Contactar a administrador del sitio para verificar el pago');

        } else {

            // Creamos objeto con la posible data de Transbank:
            req.dataTransbank = {
            token_ws: req.tokenWs2,
            TBK_TOKEN: req.tbkToken,
            TBK_ORDEN_COMPRA: req.tbkOrdenCompra,
            TBK_ID_SESION: req.tbkIdSesion
            }

            next();
        } 

    } catch (error) {
        console.error('Error al validar datos de retorno de Transbank:', error);
        res.status(500).send('Error al validar datos de retorno de Transbank. Por favor, contactar al administrador del sitio'); 
    }
};

export {validateDataClientTransbank, validateDataClient};