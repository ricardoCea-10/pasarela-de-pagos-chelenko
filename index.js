import main from "./src/Controller/home-controller.js";
import express from 'express'; // Express | ES6 Modules
import morgan from 'morgan'; // Morgan | ES6 Modules
import connectDB from './Model/db.js';

connectDB(); // Conectar a la base de datos MongoDB


main();