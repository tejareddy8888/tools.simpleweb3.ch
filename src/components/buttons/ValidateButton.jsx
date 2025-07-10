import React from 'react';

const ValidateButton = ({ shouldBeActive, onClick }) => {
    return (
        <div className="max-w-md mx-auto">
            <button
                type="button"
                onClick={onClick}
                
                className={`w-full py-2 px-4 border border-transparent  shadow-sm text-sm font-medium text-black ${shouldBeActive
                    ? 'bg-[#d1ff03]  '
                    : 'bg-gray-300 cursor-not-allowed'
                    }`}
                disabled={!shouldBeActive}
            >
                Validate
            </button>
        </div>
    );
};

export default ValidateButton;