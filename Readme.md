# Integración de Transbank | Chelenko Lodge

===================================================================

## Flujo de la Aplicación

1. **Inicio de la Transacción**

   Al acceder a la página principal de la aplicación, el servidor ejecuta la ruta configurada en `home-controller.js`, en donde:

   - Se llama a la función `createTransaction()` desde `crear-transaccion.js`, generando un identificador único (`buyOrder` y `sessionId`), el monto a cobrar y la `returnUrl`.
   - La transacción retorna un objeto que incluye el `tokenWs` y la `formAction`, los cuales se pasan a la vista `form.ejs` para el proceso de pago.

2. **Pantalla de Pago**

   La vista `form.ejs` muestra información de la transacción y un botón para pagar. Al hacer clic en el botón de pago:

   - Se envía una solicitud POST a la ruta `/iniciar-pago`.
   - Esta ruta redirige al usuario a la página de pago de Webpay usando el `tokenWs` recibido.

3. **Procesamiento de la Transacción**

   El usuario ingresa los detalles de su tarjeta en Webpay, que procesa la transacción y redirige al usuario a la URL configurada (`returnUrl`) en la aplicación para ver el estado.

4. **Consulta del Estado de la Transacción**

   - La ruta `/estado-transaccion` (en `estado-transaccion.js`) consulta el estado actual de una transacción en Webpay Plus usando la función `checkTransaccion()`.
   - Esta función se ejecuta al recibir el token (de prueba o real), que confirma el estado de la transacción (aprobada, pendiente o rechazada).

5. **Manejo del Retorno de Transbank**

   En `home-controller.js`, se maneja la ruta `/retorno`, donde:
   
   - Se recibe el `token_ws` y se llama a `confirmTransaction()` en `confirmar-transaccion.js` para verificar el estado final.
   - Dependiendo del resultado:
     - Si `response_code` es `0`, el usuario se redirige a la vista `pago-aprobado.ejs`.
     - Si no, el usuario es redirigido a `pago-rechazado.html`.

6. **Almacenamiento y Gestión de Datos en Base de Datos**

   En la carpeta `repository`, `data.js` contiene funciones para almacenar y gestionar la transacción en una base de datos MongoDB en la nube mediante la API en `http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank`.

   - **`postData()`**: Almacena los datos de la transacción en la base de datos al crearla, incluyendo `buy_order`, `session_id`, `monto`, y `token`.
   - **`confirmTransaction()`**: Al confirmar la transacción, almacena en la base de datos detalles como `response_code`, `authorization_code`, `transaction_date` y el estado final.
   - **Funcionalidades Adicionales**: Se incluyen también funciones `getData`, `getDataById`, `updateData`, y `deleteData` en caso de necesitar la consulta o administración de registros.

7. **Resultados de la Transacción**

   - **Pago Aprobado**: `pago-aprobado.ejs` muestra detalles como nombre del titular, número de tarjeta (enmascarado), monto, forma de abono, fecha y hora, código de transacción y código de autorización.
   - **Pago Rechazado**: `pago-rechazado.html` informa al usuario del fallo de pago, con opción para intentar de nuevo.

8. **Anulación o Reversión de Transacción**

   La aplicación también permite anular o revertir transacciones. Para esto, se utiliza la función `refundTransaccion()` en `reversar-anular-transaccion.js`. Esta función se puede invocar en los siguientes escenarios:

   - Si se requiere revertir una transacción después de que ha sido confirmada.
   - Si se necesita anular una transacción antes de que sea procesada por Transbank.

   La función tomará como parámetros el `token` de la transacción y el `monto` a revertir.
  
===================================================================

## Endpoints y Rutas

| Endpoint             | Método | Descripción                                                                 |
|----------------------|--------|-----------------------------------------------------------------------------|
| `/iniciar-pago`      | POST   | Inicia el proceso de pago enviando la solicitud de transacción a Webpay.    |
| `/estado-transaccion`| GET    | Consulta el estado de una transacción específica en Webpay.                 |
| `/retorno`           | POST   | Recibe el `token_ws` y verifica el estado final de la transacción.          |
| `/pago-aprobado`     | GET    | Muestra la vista de transacción aprobada si el `response_code` es `0`.      |
| `/pago-rechazado`    | GET    | Muestra la vista de pago rechazado si el `response_code` no es `0`.         |
| `/anular-transaccion`| POST   | Realiza la reversión o anulación de una transacción mediante el SDK de Transbank.|

===================================================================

## Dependencias y Configuración

Para ejecutar la aplicación, asegúrate de tener las siguientes dependencias instaladas:

- `express`: servidor web
- `morgan`: registro de solicitudes
- `ejs`: renderizado de vistas
- `transbank-sdk`: integración de Webpay
- `axios`: solicitudes HTTP a la API de la base de datos

Instala las dependencias ejecutando:

```bash
npm install
npm install transbank-sdk 
npm init -y
npm install express
npm i morgan
npm install ejs
npm i axios
