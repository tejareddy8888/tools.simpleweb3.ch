import React from 'react';

const SendToNetworkButton = ({ isValid, onClick }) => {
    return (
        <div className="max-w-md mx-auto">
            <button
                type="button"
                onClick={onClick}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black ${isValid
                    ? 'bg-[#d1ff03]'
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