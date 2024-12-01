import React from 'react';

const ValidateButton = ({ isValid, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isValid
                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
            disabled={!isValid}
        >
            Validate
        </button>
    );
};

export default ValidateButton;