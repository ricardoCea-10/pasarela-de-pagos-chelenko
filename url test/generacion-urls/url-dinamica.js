/* 2. URLs Dinámicas
En algunos casos, es posible que necesites que la URL de retorno cambie en función de la información del usuario o el contexto de la compra.

Para hacerlo dinámico, puedes generar la URL de retorno al momento de crear la transacción. Esto se puede hacer incluyendo parámetros que identifiquen la transacción específica.

Por ejemplo: */

// Definir el ID de la transacción de manera dinámica
let transactionId = "transaccion_" + Date.now();
let returnUrl = `http://miaplicacion.com/pago-exitoso?transaccion_id=${transactionId}`;

/*Esta URL incluye un parámetro (transaccion_id) que identifica la transacción. De esta manera, al recibir la solicitud de retorno, puedes saber exactamente cuál fue la transacción que se procesó. */
