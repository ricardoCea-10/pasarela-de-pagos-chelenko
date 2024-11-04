**Integración de Transbank | Chelenko Lodge**

===================================================================

**Flujo de la Aplicación**

1. Inicio de la Transacción

Cuando un usuario accede a la página principal de la aplicación, el servidor ejecuta la ruta configurada en home-controller.js. En este punto:

Se llama a la función createTransaction() desde crear-transaccion.js.
Esta función genera un identificador único para la orden y la sesión, establece el monto a cobrar y define la URL de retorno a la que Transbank redirigirá al usuario después de la transacción.
Una vez que se crea la transacción, se devuelve un objeto que incluye el tokenWs y la formAction, los cuales se pasan a la vista form.ejs.

2. Pantalla de Pago

La vista form.ejs muestra al usuario la información de la transacción y un botón para pagar. Cuando el usuario hace clic en el botón de pago:

Se envía una solicitud POST a la ruta /iniciar-pago.
Esta ruta redirige al usuario a la página de pago de Webpay usando el tokenWs recibido.

3. Procesamiento de la Transacción

El usuario ingresa los detalles de su tarjeta en la interfaz de Webpay. Después de que el usuario envía su información de pago, Transbank procesa la transacción y redirige al usuario de vuelta a la aplicación a la URL configurada (en returnUrl).

4. Manejo del Retorno de Transbank

La aplicación maneja el retorno en la ruta /retorno definida en home-controller.js. Dependiendo del método de la solicitud (POST o GET):

Se extrae el token_ws.
Se llama a la función confirmTransaction() de confirmar-transaccion.js para verificar el estado de la transacción.
Si la transacción es aprobada (código de respuesta 0), se renderiza la vista pago-aprobado.ejs, mostrando los detalles de la transacción.
Si la transacción es rechazada, el usuario es redirigido a pago-rechazado.html.

5. Resultados de la Transacción

a. Pago Aprobado
En pago-aprobado.ejs, se muestran detalles como el nombre del titular (a completar), el número de tarjeta (enmascarado), el monto pagado, la forma de abono, la fecha y hora de la transacción, el código de transacción y el código de autorización.

b. Pago Rechazado
Si el pago es rechazado, la vista pago-rechazado.html informa al usuario que el pago no pudo ser procesado, con una opción para volver a intentar.

===================================================================

**Dependencias y Configuración**

Para ejecutar la aplicación, asegúrate de tener las siguientes dependencias instaladas:

express: para la creación del servidor.
morgan: para el registro de solicitudes.
ejs: para el renderizado de vistas.
transbank-sdk: para la integración con la pasarela de pagos.
Ejecuta los siguientes comandos para instalar las dependencias necesarias:

Ejecutar:

- npm install
- npm install transbank-sdk 
- npm init -y
- npm install express
- npm i morgan
- npm install ejs
- npm install axios

Luego agregar  "type" : "module" al archivo package.json para habilitar el uso de ES Modules.

===================================================================

### Para ejecutar:

- node index.js

Accede a http://localhost:3000 en tu navegador.