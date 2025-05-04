import React from 'react';

export default function ErrorMessage({ message, onRetry }) {
    return (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 p-4 rounded">
            <p className="font-medium">{message || 'An error occurred'}</p>
            {onRetry && (
                <button
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={onRetry}
                >
                    Retry
                </button>
            )}
        </div>
    );
}