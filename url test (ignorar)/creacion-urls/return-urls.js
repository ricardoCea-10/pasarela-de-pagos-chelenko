/* Cómo Crear las URLs de Retorno
Definir las URLs en tu Aplicación

Necesitas crear rutas específicas en tu servidor para manejar diferentes resultados del proceso de pago. Por ejemplo, podrías tener rutas como:

Para un pago exitoso: /pago-exitoso
Para un pago rechazado: /pago-rechazado
Estas rutas serán definidas en el código de tu servidor, por lo general utilizando un framework como Express.

Implementación en Express

En Express (que es lo que se utiliza en tu proyecto), estas URLs se crean como rutas que responderán a las solicitudes HTTP. */

import express from 'express';
const app = express();

// URL de retorno para pago aprobado
app.post('/pago-exitoso', (req, res) => {
    // Aquí se procesará la respuesta de Transbank para verificar el estado del pago
    const { token_ws } = req.body; // token_ws es el token de la transacción

    // Lógica para confirmar la transacción (consultar a Transbank con el token recibido)
    // Se podría usar la función confirmTransaction() con el token_ws
    
    console.log('Pago aprobado, token:', token_ws);
    res.send('Pago aprobado. Gracias por su compra.');
});

// URL de retorno para pago rechazado
app.post('/pago-rechazado', (req, res) => {
    // Aquí se maneja el caso en el que la transacción fue rechazada
    console.log('Pago rechazado');
    res.send('Pago rechazado. Por favor, intente nuevamente.');
});

// Inicializar el servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
