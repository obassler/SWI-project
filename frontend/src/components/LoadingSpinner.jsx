import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-300"></div>
            <p className="mt-2 text-yellow-300">{message}</p>
        </div>
    );
}