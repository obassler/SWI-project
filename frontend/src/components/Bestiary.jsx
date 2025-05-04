import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Bestiary() {
    const [monsters, setMonsters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMonsters = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getMonsters();
            setMonsters(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load monsters');
            setLoading(false);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMonsters();
    }, []);

    if (loading) return <LoadingSpinner message="Loading monsters..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchMonsters} />;

    return (
        <div className="bg-gray-700 p-4 rounded space-y-4">
            <h2 className="text-2xl text-yellow-300">Bestiary</h2>
            {monsters.length === 0 ? (
                <p className="text-gray-300">No monsters available.</p>
            ) : (
                <ul className="space-y-2">
                    {monsters.map(m => (
                        <li key={m.id} className="bg-gray-600 p-3 rounded">
                            <div><strong>{m.name}</strong></div>
                            <div>HP: {m.hp} | AC: {m.ac}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}