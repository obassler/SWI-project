import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function CharacterDetail() {
    const { id } = useParams();
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCharacter = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getCharacter(id);
            setCharacter(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load character');
            setLoading(false);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCharacter();
    }, [id]);

    if (loading) return <LoadingSpinner message="Loading character..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchCharacter} />;
    if (!character) return <p className="text-red-500">Character not found.</p>;

    return (
        <div className="bg-gray-700 p-4 rounded space-y-4">
            <h2 className="text-2xl text-yellow-300">{character.name}</h2>
            <div>
                <strong>HP:</strong> {character.hp}
            </div>
            <div>
                <strong>Status:</strong> {character.status}
            </div>
            <div>
                <strong>Inventory:</strong>
                {character.inventory && character.inventory.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {character.inventory.map((item, index) => (
                            <li key={index}>{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No items in inventory</p>
                )}
            </div>
            <Link to="/" className="text-blue-400 hover:underline">Back to Dashboard</Link>
        </div>
    );
}