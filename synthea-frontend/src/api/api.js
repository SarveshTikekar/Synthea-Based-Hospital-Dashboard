import axios from "axios"

/*For betterment we would use functions*/
const API_URL = "http://127.0.0.1:3001"

export const generatePatients = async({numberOfPatients}) => {

	try{
		
		const resp = await axios.get(`${API_URL}/generate_data`, {params:{num_patients: numberOfPatients}})
		
		if(resp.status == 200)
			return {message: `Successfully generated data for ${numberOfPatients}`, patientCount: numberOfPatients}

		return {message: `Error in generation`, cause: `${resp.status} --> ${resp.statusText}`}

	}
	catch(err){
		
		return {message: `Error in patient generation`, reason: `${err}`};
	}
}

export const getPatientCount = async() => {
	try{
		const resp = await axios.get(`${API_URL}/get_patient_count`)
		
		if(resp.status == 200)
			return {patientCount: resp.data.patient_count}

		return {message: `Error in generation`, cause: `${resp.status} --> ${resp.statusText}`}
	}
	catch(err){	
		return {message: `Error in patient generation`, reason: `${err}`};
	}
}


export const patientDashboard = async() => {
	
	try{
		const resp = await axios.get(`${API_URL}/patient_dashboard`)
		if (resp.status == 200)
			return {patient_dashboard: resp.data}

		return {message: 'Error in generation', reason: `${resp.status} --> ${resp.statusText}`}

	}catch(err){
		return {message: 'Error in generating metrics', reason: `${err}`}
	}
}


export const conditionsDashboard = async() => {
	
	try{
		const resp = await axios.get(`${API_URL}/conditions_dashboard`)
		if (resp.status == 200)
			return {conditions_dashboard: resp.data}

		return {message: 'error in generation', reason: `${resp.status} --> ${resp.statusText}`}

	}catch(err){
		return {message: 'error in generating metrics', reason: `${err}`}
	}
}

export const allergiesDashboard = async() => {
	
	try{
		const resp = await axios.get(`${API_URL}/allergies_dashboard`)
		if (resp.status == 200)
			return {allergies_dashboard: resp.data}

		return {message: 'error in generation', reason: `${resp.status} --> ${resp.statusText}`}

	}catch(err){
		return {message: 'error in generating metrics', reason: `${err}`}
	}
}
