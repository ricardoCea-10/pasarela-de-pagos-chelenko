
import axios from 'axios';


// Función para obtener data de base de datos:
async function getData() {

    try {
        let response = await axios.get("http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank");
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos DB Api:', error);
        return { error: 'Error al obtener datos DB Api' };

    }

}

// Función para obtener data de Transbank de base de datos por id:
async function getDataById(id) {

    try {
        let response = await axios.get(`http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos DB Api por id:', error);
        return { error: 'Error al obtener datos DB Api por id' };

    }

}

// Función para obtener data de reservas de base de datos por id:
async function getDataReservationById(id) {

    try {
        let response = await axios.get(`http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/guests/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos de reserva DB Api por id:', error);
        return { error: 'Error al obtener datos de reserva DB Api por id' };

    }

}

// Función para almacenar data en base de datos:
async function postData(data) {

    let dataTransbank = data;
    try {
        const response = await axios.post("http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank", dataTransbank);
        if(response !== undefined) {
            console.log("");
            console.log("Transacción almacenada correctamente en base de datos.");
        } else {
            console.log("");
            console.log("Error: Transacción no almacenada en base de datos.");
        }
        return response.data;

    } catch (error) {
        console.error('Error al almacenar datos en DB API');
        return { error: 'Error al almacenar datos en DB API' };
        
    }

}

// Funcion para actualizar la data por su id:
async function updateData(id, data) {

    let dataTransbank = data;

    try {
        const response = await axios.put(`http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank/${id}`, dataTransbank);
        return response.data;
    } catch (error) {
        console.error('Error al editar datos DB Api por id:', error);
        return { error: 'Error al editar datos DB Api por id' };

    }

}
 // Función para eliminar datos en base de datos por id:
async function deleteData(id) {

    try {
        let response = await axios.delete(`http://chelenko-data.sa-east-1.elasticbeanstalk.com/api/transbank/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar datos BD Api:', error);
        return { error: 'Error al eliminar datos BD Api' };
    }
}

export { getData, getDataById, getDataReservationById, postData, updateData, deleteData };