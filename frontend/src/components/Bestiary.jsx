import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Bestiary() {
    const [monsters, setMonsters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMonster, setNewMonster] = useState({
        name: '',
        description: '',
        health: '',
        attack: '',
        defense: '',
        boss: false,
        abilities: '',
        type: '',
    });
    const [editingMonsterId, setEditingMonsterId] = useState(null);
    const [addingMonster, setAddingMonster] = useState(false);

    const fetchMonsters = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getMonsters();
            setMonsters(data);
        } catch (err) {
            setError('Failed to load monsters');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonsters();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewMonster(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addOrUpdateMonster = async () => {
        const payload = {
            ...newMonster,
            health: parseInt(newMonster.health),
            attack: parseInt(newMonster.attack),
            defense: parseInt(newMonster.defense),
        };

        try {
            setAddingMonster(true);
            if (editingMonsterId) {
                const updated = await api.updateMonster(editingMonsterId, payload);
                setMonsters(monsters.map(m => (m.id === editingMonsterId ? updated : m)));
                setEditingMonsterId(null);
            } else {
                const added = await api.createMonster(payload);
                setMonsters([...monsters, added]);
            }
            setNewMonster({
                name: '',
                description: '',
                health: '',
                attack: '',
                defense: '',
                boss: false,
                abilities: '',
                type: '',
            });
        } catch (err) {
            setError('Failed to save monster');
            console.error(err);
        } finally {
            setAddingMonster(false);
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

    const startEdit = (monster) => {
        setEditingMonsterId(monster.id);
        setNewMonster({
            name: monster.name,
            description: monster.description,
            health: monster.health,
            attack: monster.attack,
            defense: monster.defense,
            boss: monster.boss,
            abilities: monster.abilities,
            type: monster.type,
        });
    };

    if (loading) return <LoadingSpinner message="Loading monsters..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchMonsters} />;

    return (
        <div className="bg-gray-700 p-4 rounded space-y-4">
            <h2 className="text-2xl text-yellow-300">Bestiary</h2>

            {/* Add/Edit Monster Form */}
            <div className="bg-gray-600 p-3 rounded mb-4 space-y-2">
                <h3 className="text-xl text-yellow-200">
                    {editingMonsterId ? 'Edit Monster' : 'Add New Monster'}
                </h3>

                {['name', 'description', 'abilities', 'type'].map(field => (
                    <input
                        key={field}
                        type="text"
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={newMonster[field]}
                        onChange={handleInputChange}
                        className="p-2 bg-gray-500 text-gray-100 rounded w-full"
                    />
                ))}

                {['health', 'attack', 'defense'].map(field => (
                    <input
                        key={field}
                        type="number"
                        name={field}
                        placeholder={field.toUpperCase()}
                        value={newMonster[field]}
                        onChange={handleInputChange}
                        className="p-2 bg-gray-500 text-gray-100 rounded w-full"
                    />
                ))}

                <label className="flex items-center space-x-2 text-gray-200">
                    <input
                        type="checkbox"
                        name="boss"
                        checked={newMonster.boss}
                        onChange={handleInputChange}
                    />
                    <span>Is Boss?</span>
                </label>

                <button
                    onClick={addOrUpdateMonster}
                    disabled={addingMonster}
                    className={`px-3 py-1 rounded ${addingMonster ? 'bg-gray-500' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                >
                    {addingMonster ? 'Saving...' : editingMonsterId ? 'Update Monster' : 'Add Monster'}
                </button>
            </div>

            {/* Monster List */}
            {monsters.length === 0 ? (
                <p className="text-gray-300">No monsters available.</p>
            ) : (
                <ul className="space-y-2">
                    {monsters.map((monster) => (
                        <li key={monster.id} className="bg-gray-600 p-3 rounded flex justify-between items-start">
                            <div>
                                <strong>{monster.name}</strong> {monster.boss && <span className="text-red-400">(Boss)</span>}
                                <div>HP: {monster.health} | ATK: {monster.attack} | DEF: {monster.defense}</div>
                                <div>Type: {monster.type}</div>
                                <div className="text-sm text-gray-300">{monster.description}</div>
                                <div className="text-sm text-blue-300">Abilities: {monster.abilities}</div>
                            </div>
                            <div className="space-x-2">
                                <button
                                    className="text-green-400 hover:text-green-600"
                                    onClick={() => startEdit(monster)}
                                >
                                    ✎
                                </button>
                                <button
                                    className="text-red-400 hover:text-red-600"
                                    onClick={() => deleteMonster(monster.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
