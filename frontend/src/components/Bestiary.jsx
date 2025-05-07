import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Bestiary() {
    const [monsters, setMonsters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMonster, setNewMonster] = useState({
        name: '', description: '', health: '', attack: '', defense: '', boss: false, abilities: '', type: '',
    });
    const [editingMonsterId, setEditingMonsterId] = useState(null);

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

    const saveMonster = async () => {
        const payload = {
            ...newMonster,
            health: parseInt(newMonster.health),
            attack: parseInt(newMonster.attack),
            defense: parseInt(newMonster.defense),
        };
        try {
            const res = editingMonsterId
                ? await api.updateMonster(editingMonsterId, payload)
                : await api.createMonster(payload);
            await fetchMonsters();
            setNewMonster({ name: '', description: '', health: '', attack: '', defense: '', boss: false, abilities: '', type: '' });
            setEditingMonsterId(null);
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

    if (loading) return <LoadingSpinner message="Loading monsters..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchMonsters} />;

    return (
        <div className="p-4 space-y-6 text-white">

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
                <button onClick={saveMonster} className="bg-yellow-600 px-4 py-1 rounded hover:bg-yellow-700">Save</button>
            </div>

            <ul className="space-y-3">
                {monsters.map(mon => (
                    <li key={mon.id} className="bg-gray-700 p-4 rounded">
                        <h3 className="text-yellow-300 font-semibold">{mon.name} {mon.boss && <span className="text-red-500">(Boss)</span>}</h3>
                        <p className="text-gray-300 text-sm">{mon.description}</p>
                        <p className="text-gray-400 text-sm">Type: {mon.type} | HP: {mon.health}, ATK: {mon.attack}, DEF: {mon.defense}</p>
                        <p className="text-blue-300 text-sm">Abilities: {mon.abilities}</p>
                        <div className="flex gap-3 mt-2">
                            <button onClick={() => { setEditingMonsterId(mon.id); setNewMonster(mon); }} className="text-green-400 hover:text-green-600">✎</button>
                            <button onClick={() => deleteMonster(mon.id)} className="text-red-400 hover:text-red-600">✕</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}