
import axios from 'axios';


// Función para obtener data de base de datos:
async function getData() {

    try {
        let response = await axios.get("http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank");
        console.log("BANDERA 7. response.data: ", response.data);
        return response.data;
    } catch (error) {
        console.error('BANDERA 7. Error al obtener datos:', error);
        return { error: 'Error al obtener datos' };

    }

}

// Función para obtener data de base de datos por id:
async function getDataById(id) {

    try {
        let response = await axios.get(`http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank/${id}`);
        console.log("BANDERA 8. response.data: ", response.data);
        return response.data;
    } catch (error) {
        console.error('BANDERA 8. Error al obtener datos por id:', error);
        return { error: 'Error al obtener datos por id' };

    }

}

// Función para almacenar data en base de datos:
async function postData(data) {

    let dataTransbank = data;
    console.log("BANDERA 5. dataTransbank (Base datos): ", dataTransbank);

    
    try {
        const response = await axios.post("http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank", dataTransbank);
        if(response) {
            console.log("BANDERA 6. Transacción almacenada en base de datos. response.data: ", response.data);

        } else {
            console.log("BANDERA 6. Error: Transacción no almacenada en base de datos. response.data: ", response.data);

        }
        return response.data;

    } catch (error) {
        console.error('BANDERA 6. Error al enviar datos:', error);
        return { error: 'Error al enviar datos' };
        
    }

}

// Funcion para actualizar la data por su id:
async function updateData(id, data) {

    let dataTransbank = data;
    console.log("BANDERA 9. dataTransbank (Base datos): ", dataTransbank);

    try {
        const response = await axios.put(`http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank/${id}`, dataTransbank);
        console.log("BANDERA 10. response.data: ", response.data);
        return response.data;
    } catch (error) {
        console.error('BANDERA 10. Error al editar datos:', error);
        return { error: 'Error al editar datos' };

    }

}
 // Función para eliminar datos en base de datos por id:
async function deleteData(id) {

    try {
        let response = await axios.delete(`http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank/${id}`);
        console.log("BANDERA 9. response.data (eliminar): ", response.data);
        return response.data;
    } catch (error) {
        console.error('BANDERA 9. Error al eliminar datos:', error);
        return { error: 'Error al eliminar datos' };
    }
}

export { getData, getDataById, postData, updateData, deleteData };