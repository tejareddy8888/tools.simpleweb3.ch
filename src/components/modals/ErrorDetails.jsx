import React from 'react';

const ErrorDetails = ({ errorCode, errorMessage }) => {
    return (
        <div className="max-w-md mx-auto my-auto p-4 bg-white rounded-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Error Details</h2>
            <div className="space-y-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Error Code:</label>
                    <output className="my-auto block w-full px-3 py-2 bg-gray-100 rounded-md">
                        {errorCode}
                    </output>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Error Message:</label>
                    <output className="my-auto block w-full px-3 py-2 bg-gray-100 rounded-md">
                        {errorMessage}
                    </output>
                </div>
            </div>
        </div>
    );
};

export default ErrorDetails;