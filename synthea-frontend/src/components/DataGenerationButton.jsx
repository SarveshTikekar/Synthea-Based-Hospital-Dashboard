import React, { useState } from "react";

const DataGenerationButton = ({numberOfPatients}) => {
	
	const [message, setMessage] = useState("")

	return(
		
		<>
		<div className="p-2">	
		<button className="text-black border-2 border-red-400 hover: cursor-pointer" onClick={() => setMessage(`Buttom with ${numberOfPatients} was pressed`)}> {numberOfPatients} </button>
		</div>

		<div> <p className="text-green-200"> {message} </p>
		</div>

		</>
	)
}

export default DataGenerationButton;
