import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Bestiary() {
    const [monsters, setMonsters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMonster, setNewMonster] = useState({ name: '', hp: '', ac: '' });
    const [addingMonster, setAddingMonster] = useState(false);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMonster(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const addMonster = async () => {
        if (newMonster.name.trim() && newMonster.hp && newMonster.ac) {
            setAddingMonster(true);
            try {
                const addedMonster = await api.createMonster(newMonster);
                setMonsters([...monsters, addedMonster]);
                setNewMonster({ name: '', hp: '', ac: '' }); // Reset form
            } catch (err) {
                setError('Failed to add monster');
                console.error(err);
            } finally {
                setAddingMonster(false);
            }
        }
    };

    const deleteMonster = async (id) => {
        try {
            await api.deleteMonster(id);
            setMonsters(monsters.filter(monster => monster.id !== id));
        } catch (err) {
            setError('Failed to delete monster');
            console.error(err);
        }
    };

    if (loading) return <LoadingSpinner message="Loading monsters..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchMonsters} />;

    return (
        <div className="bg-gray-700 p-4 rounded space-y-4">
            <h2 className="text-2xl text-yellow-300">Bestiary</h2>

            {/* Add Monster Form */}
            <div className="bg-gray-600 p-3 rounded mb-4">
                <h3 className="text-xl text-yellow-200">Add New Monster</h3>
                <input
                    type="text"
                    name="name"
                    placeholder="Monster Name"
                    value={newMonster.name}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-500 text-gray-100 rounded w-full mb-2"
                />
                <input
                    type="number"
                    name="hp"
                    placeholder="HP"
                    value={newMonster.hp}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-500 text-gray-100 rounded w-full mb-2"
                />
                <input
                    type="number"
                    name="ac"
                    placeholder="AC"
                    value={newMonster.ac}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-500 text-gray-100 rounded w-full mb-2"
                />
                <button
                    onClick={addMonster}
                    disabled={addingMonster}
                    className={`px-3 py-1 rounded ${addingMonster ? 'bg-gray-500' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                >
                    {addingMonster ? 'Adding...' : 'Add Monster'}
                </button>
            </div>

            {/* Monster List */}
            {monsters.length === 0 ? (
                <p className="text-gray-300">No monsters available.</p>
            ) : (
                <ul className="space-y-2">
                    {monsters.map((monster) => (
                        <li key={monster.id} className="bg-gray-600 p-3 rounded flex justify-between items-center">
                            <div>
                                <strong>{monster.name}</strong>
                                <div>HP: {monster.hp} | AC: {monster.ac}</div>
                            </div>
                            <button
                                className="text-red-400 hover:text-red-600 px-2"
                                onClick={() => deleteMonster(monster.id)}
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
