import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getItems();
            setItems(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load items');
            setLoading(false);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    if (loading) return <LoadingSpinner message="Loading items..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchItems} />;

    return (
        <div className="bg-gray-700 p-4 rounded space-y-4">
            <h2 className="text-2xl text-yellow-300">Items</h2>
            {items.length === 0 ? (
                <p className="text-gray-300">No items available.</p>
            ) : (
                <ul className="grid grid-cols-2 gap-4">
                    {items.map(item => (
                        <li key={item.id} className="bg-gray-600 p-2 rounded">
                            <strong>{item.name}</strong>
                            <div className="text-sm text-gray-300">{item.type}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}