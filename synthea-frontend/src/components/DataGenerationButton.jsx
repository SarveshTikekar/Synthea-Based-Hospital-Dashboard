import React from "react";

const DataGenerationButton = ({ numberOfPatients, onGenerate, isLoading }) => {
    return (
        <button 
            onClick={() => onGenerate(numberOfPatients)}
            disabled={isLoading}
            className={`
                px-6 py-3 rounded-xl font-bold border-2 transition-all active:scale-95
                ${isLoading 
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                    : "bg-white text-gray-700 border-gray-200 hover:border-teal-500 hover:text-teal-600 hover:shadow-md"
                }
            `}
        > 
            Generate {numberOfPatients} 
        </button>
    );
};

export default DataGenerationButton;
