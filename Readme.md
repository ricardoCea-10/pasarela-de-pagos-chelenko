
   - Si se requiere revertir una transacción después de que ha sido confirmada.
   - Si se necesita anular una transacción antes de que sea procesada por Transbank.

   La función tomará como parámetros el `token` de la transacción y el `monto` a revertir.
  
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
```

Agrega `"type": "module"` al archivo `package.json` para habilitar el uso de ES Modules.

===================================================================

## Ejecución del Proyecto

Ejecuta el servidor con:

```bash
node index.js
```

Luego accede a (http://localhost:3000) en tu navegador para iniciar el flujo de la aplicación.