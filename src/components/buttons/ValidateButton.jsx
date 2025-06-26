import React from 'react';

const ValidateButton = ({ shouldBeActive, onClick }) => {
    return (
        <div className="max-w-md mx-auto">
            <button
                type="button"
                onClick={onClick}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${shouldBeActive
                    ? 'bg-customTangerine bg-opacity-80 hover:bg-opacity-100 '
                    : 'bg-purple-300 cursor-not-allowed'
                    }`}
                disabled={!shouldBeActive}
            >
                Validate
            </button>
        </div>
    );
};

export default ValidateButton;