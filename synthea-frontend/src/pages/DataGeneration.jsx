import React from "react";
import DataGenerationButton from "@/components/DataGenerationButton";
 
const DataGeneration = () => {
	
	const generatePatientData = () =>{
		
		return -1;
	}

	return (
		
		<div className="flex">
		<DataGenerationButton numberOfPatients={100}/>	
		<DataGenerationButton numberOfPatients={200}/>
		<DataGenerationButton numberOfPatients={300}/>
		</div>
	)
}

export default DataGeneration;
