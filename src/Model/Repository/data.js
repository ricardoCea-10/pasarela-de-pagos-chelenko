
import axios from 'axios';

// Función para almacenar data en base de datos:
async function postData(data) {

    let dataTransbank = data;
    console.log("BANDERA 5. dataTransbank (Base datos): ", dataTransbank);

    /*
    try {
        const response = await axios.post("http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank", dataTransbank);
        console.log("BANDERA 6. response.data: ", response.data);
        return response.data;
    } catch (error) {
        console.error('BANDERA 6. Error al enviar datos:', error);
        return { error: 'Error al enviar datos' };
        
    }
    */

}

export default postData;