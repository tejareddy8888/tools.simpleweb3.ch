import React from 'react';

const SendToNetworkButton = ({ isValid, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isValid
                    ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
            disabled={!isValid}
        >
            Send to Network
        </button>
    );
};

export default SendToNetworkButton;