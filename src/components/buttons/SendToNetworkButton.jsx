import React from 'react';

const SendToNetworkButton = ({ isValid, onClick }) => {
    return (
        <div className="max-w-md mx-auto">
            <button
                type="button"
                onClick={onClick}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isValid
                    ? 'bg-customTangerine bg-opacity-80 hover:bg-opacity-100'
                    : 'bg-gray-300 cursor-not-allowed'
                    }`}
                disabled={!isValid}
            >
                Send to Network
            </button>
        </div>
    );
};

export default SendToNetworkButton;