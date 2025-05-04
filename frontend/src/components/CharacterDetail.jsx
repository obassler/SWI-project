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
            // Ensure we have all required fields with defaults
            const processedCharacter = {
                ...data,
                currentHp: data.currentHp ?? 0,
                maxHp: data.maxHp ?? 0,
                strength: data.strength ?? 10,
                dexterity: data.dexterity ?? 10,
                constitution: data.constitution ?? 10,
                intelligence: data.intelligence ?? 10,
                wisdom: data.wisdom ?? 10,
                charisma: data.charisma ?? 10,
                status: data.status || 'Healthy',
                items: data.items || [],
                spells: data.spells || [],
                race: data.race || { name: 'Unknown' },
                characterClass: data.characterClass || { name: 'Unknown' },
                background: data.background || '',
                alignment: data.alignment || '',
                specialization: data.specialization || '',
                notes: data.notes || ''
            };
            setCharacter(processedCharacter);
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
        <div className="bg-gray-800 p-6 rounded-lg max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-yellow-400">{character.name}</h1>
                    <p className="text-gray-300">
                        {character.race.name} {character.characterClass.name} • Level {character.level}
                    </p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg min-w-[200px]">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-300">HP:</span>
                        <span className="font-bold text-red-400">
                            {character.currentHp} / {character.maxHp}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Status:</span>
                        <span className="capitalize">{character.status.toLowerCase()}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Abilities Column */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-yellow-300 mb-4">Abilities</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { name: 'STR', value: character.strength },
                            { name: 'DEX', value: character.dexterity },
                            { name: 'CON', value: character.constitution },
                            { name: 'INT', value: character.intelligence },
                            { name: 'WIS', value: character.wisdom },
                            { name: 'CHA', value: character.charisma }
                        ].map((ability) => (
                            <div key={ability.name} className="bg-gray-800 p-2 rounded text-center">
                                <div className="text-gray-400 text-sm">{ability.name}</div>
                                <div className="text-xl font-bold">{ability.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Character Details Column */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-yellow-300 mb-4">Character Details</h2>
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-gray-400 text-sm">Background</h3>
                            <p>{character.background || 'None provided'}</p>
                        </div>
                        <div>
                            <h3 className="text-gray-400 text-sm">Alignment</h3>
                            <p>{character.alignment || 'Unknown'}</p>
                        </div>
                        <div>
                            <h3 className="text-gray-400 text-sm">Specialization</h3>
                            <p>{character.specialization || 'None'}</p>
                        </div>
                    </div>
                </div>

                {/* Notes Column */}
                <div className="bg-gray-700 p-4 rounded-lg lg:col-span-1">
                    <h2 className="text-xl font-semibold text-yellow-300 mb-4">Notes</h2>
                    <div className="bg-gray-800 p-3 rounded whitespace-pre-line min-h-[150px]">
                        {character.notes || 'No notes available'}
                    </div>
                </div>
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Inventory Section */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-yellow-300">Inventory</h2>
                        <span className="text-gray-400 text-sm">
                            {character.items.length} items
                        </span>
                    </div>
                    {character.items.length > 0 ? (
                        <ul className="space-y-2">
                            {character.items.map((item, index) => (
                                <li key={index} className="bg-gray-800 p-3 rounded flex justify-between">
                                    <span>{item.name}</span>
                                    {item.quantity > 1 && (
                                        <span className="text-gray-400">x{item.quantity}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic">No items in inventory</p>
                    )}
                </div>

                {/* Spells Section */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-yellow-300">Spells</h2>
                        <span className="text-gray-400 text-sm">
                            {character.spells.length} spells
                        </span>
                    </div>
                    {character.spells.length > 0 ? (
                        <ul className="space-y-2">
                            {character.spells.map((spell, index) => (
                                <li key={index} className="bg-gray-800 p-3 rounded">
                                    {spell.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic">No spells known</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                <Link 
                    to="/" 
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-center transition-colors"
                >
                    ← Back to Dashboard
                </Link>
                <div className="flex gap-3">
                    <Link 
                        to={`/characters/${id}/edit`} 
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-center transition-colors"
                    >
                        Edit Character
                    </Link>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">
                        Delete Character
                    </button>
                </div>
            </div>
        </div>
    );
}
