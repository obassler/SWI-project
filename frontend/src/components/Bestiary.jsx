import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const emptyForm = {
    name: '', description: '', health: '', attack: '', defense: '', boss: false, abilities: '', type: '',
};

export default function Bestiary() {
    const [monsters, setMonsters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMonster, setNewMonster] = useState({ ...emptyForm });
    const [editingMonsterId, setEditingMonsterId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { fetchMonsters(); }, []);

    const fetchMonsters = async () => {
        setLoading(true);
        try {
            const data = await api.getMonsters();
            setMonsters(data);
        } catch (err) {
            setError('Failed to load monsters');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewMonster(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const resetForm = () => {
        setNewMonster({ ...emptyForm });
        setEditingMonsterId(null);
        setShowForm(false);
    };

    const saveMonster = async () => {
        const payload = {
            ...newMonster,
            health: parseInt(newMonster.health),
            attack: parseInt(newMonster.attack),
            defense: parseInt(newMonster.defense),
        };
        try {
            editingMonsterId
                ? await api.updateMonster(editingMonsterId, payload)
                : await api.createMonster(payload);
            await fetchMonsters();
            resetForm();
        } catch (err) {
            setError('Failed to save monster');
        }
    };

    const deleteMonster = async (id) => {
        try {
            await api.deleteMonster(id);
            fetchMonsters();
        } catch {
            setError('Failed to delete monster');
        }
    };

    const startEdit = (mon) => {
        setEditingMonsterId(mon.id);
        setNewMonster({
            name: mon.name || '',
            description: mon.description || '',
            health: mon.health?.toString() || '',
            attack: mon.attack?.toString() || '',
            defense: mon.defense?.toString() || '',
            boss: mon.boss || false,
            abilities: mon.abilities || '',
            type: mon.type || '',
        });
        setShowForm(true);
    };

    if (loading) return <LoadingSpinner message="Loading monsters..." />;
    if (error && !monsters.length) return <ErrorMessage message={error} onRetry={fetchMonsters} />;

    return (
        <div className="p-4 space-y-6 text-white">
            <button
                onClick={() => {
                    if (editingMonsterId) {
                        setEditingMonsterId(null);
                        setNewMonster({ ...emptyForm });
                    }
                    setShowForm(!showForm);
                }}
                className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
                {showForm ? (editingMonsterId ? 'Cancel Edit' : 'Hide Form') : 'Create New Monster'}
            </button>

            {showForm && (
                <div className="bg-gray-700 p-4 rounded space-y-2">
                    <h2 className="text-xl text-yellow-200">{editingMonsterId ? 'Edit Monster' : 'Add New Monster'}</h2>
                    {["name", "description", "abilities", "type"].map(field => (
                        <input key={field} name={field} value={newMonster[field]} onChange={handleInputChange} placeholder={field}
                               className="w-full p-2 rounded bg-gray-600 text-white" />
                    ))}
                    {["health", "attack", "defense"].map(field => (
                        <input key={field} type="number" name={field} value={newMonster[field]} onChange={handleInputChange} placeholder={field.toUpperCase()}
                               className="w-full p-2 rounded bg-gray-600 text-white" />
                    ))}
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="boss" checked={newMonster.boss} onChange={handleInputChange} /> Boss?
                    </label>
                    <div className="flex gap-4 mt-2">
                        <button onClick={saveMonster} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
                            {editingMonsterId ? 'Update Monster' : 'Create Monster'}
                        </button>
                        <button onClick={resetForm} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancel</button>
                    </div>
                </div>
            )}

            {error && monsters.length > 0 && <ErrorMessage message={error} onRetry={fetchMonsters} />}

            <ul className="space-y-3">
                {monsters.map(mon => (
                    <li key={mon.id} className="bg-gray-800 p-4 rounded">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-yellow-300 font-semibold">{mon.name} {mon.boss && <span className="text-red-500">(Boss)</span>}</h3>
                                <p className="text-gray-300 text-sm">{mon.description}</p>
                                <p className="text-gray-400 text-sm">Type: {mon.type} | HP: {mon.health}, ATK: {mon.attack}, DEF: {mon.defense}</p>
                                <p className="text-blue-300 text-sm">Abilities: {mon.abilities}</p>
                            </div>
                            <div className="flex gap-3 text-lg">
                                <button onClick={() => startEdit(mon)} className="text-green-400 hover:text-green-600">✎</button>
                                <button onClick={() => deleteMonster(mon.id)} className="text-red-400 hover:text-red-600">✕</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
