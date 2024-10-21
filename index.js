import main from "./Controller/home-controller.js";
import express from 'express'; // Express | ES6 Modules
import morgan from 'morgan'; // Morgan | ES6 Modules

document.getElementById("boton-pago").addEventListener("click", async () => {
    try {
        const response = await fetch("/iniciar-pago", { method: "POST" });
        const data = await response.json();
        
        if (data.url) {
            // Redirige al usuario a la URL de pago proporcionada por el backend
            window.location.href = data.url;
        } else {
            console.error("No se pudo iniciar el pago");
        }
    } catch (error) {
        console.error("Error en la solicitud al backend:", error);
    }
});
const express = require('express');
const { WebpayPlus } = require('transbank-sdk');
const app = express();
const express = require('express');
const morgan = require('morgan'); // Importar morgan


// Usar morgan para registrar todas las solicitudes HTTP
app.use(morgan('dev'));

// Resto de tu configuración de rutas...


app.use(express.json());

app.post('/iniciar-pago', async (req, res) => {
    const { monto, descripcion } = req.body;
    
    const buyOrder = 'orden-' + Math.floor(Math.random() * 1000000); // Genera una orden única
    const sessionId = 'session-' + Math.floor(Math.random() * 1000000);
    const returnUrl = 'https://webpay.transbank.cl/initTransaction'; // URL de retorno para confirmar el pago
    
    try {
        // Crea la transacción con Webpay Plus
        const transaction = new WebpayPlus.Transaction();
        const response = await transaction.create(buyOrder, sessionId, monto, returnUrl);

        // Enviar al frontend la URL para redirigir al usuario
        res.json({ url: response.url, token: response.token });
    } catch (error) {
        res.status(500).json({ error: "Error al iniciar la transacción con Webpay" });
    }
});

app.listen(3000, () => {
    console.log('Servidor backend en ejecución en puerto 3000');
});

    

main();