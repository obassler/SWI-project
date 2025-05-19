import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Spells() {
    const [spells, setSpells] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newSpell, setNewSpell] = useState({
        name: '', description: '', type: '', level: '',
    });
    const [editingSpellId, setEditingSpellId] = useState(null);

    useEffect(() => { fetchSpells(); }, []);

    const fetchSpells = async () => {
        setLoading(true);
        try {
            const data = await api.getSpells();
            setSpells(data);
        } catch (err) {
            setError('Failed to load spells');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewSpell(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const saveSpell = async () => {
        const payload = {
            ...newSpell,
        };
        try {
            const res = editingSpellId
                ? await api.updateSpell(editingSpellId, payload)
                : await api.createSpell(payload);
            await fetchSpells();
            setNewSpell({ name: '', description: '', type: '', level: ''});
            setEditingSpellId(null);
        } catch (err) {
            setError('Failed to save spell');
        }
    };

    const deleteSpell = async (id) => {
        try {
            await api.deleteSpell(id);
            fetchSpells();
        } catch {
            setError('Failed to delete spell');
        }
    };

    return (
        <div className="p-4 space-y-6 text-white">

            <div className="bg-gray-700 p-4 rounded space-y-2">
                <h2 className="text-xl text-yellow-200">{editingSpellId ? 'Edit Spell' : 'Add New Spell'}</h2>
                {["name", "description", "type"].map(field => (
                    <input key={field} name={field} value={newSpell[field]} onChange={handleInputChange} placeholder={field}
                           className="w-full p-2 rounded bg-gray-600 text-white" />
                ))}
                {["level"].map(field => (
                    <input key={field} type="number" name={field} value={newSpell[field]} onChange={handleInputChange} placeholder={field.toUpperCase()}
                           className="w-full p-2 rounded bg-gray-600 text-white" />
                ))}
                <button onClick={saveSpell} className="bg-yellow-600 px-4 py-1 rounded hover:bg-yellow-700">Save</button>
            </div>

            <ul className="space-y-3">
                {spells.map(spe => (
                    <li key={spe.id} className="bg-gray-700 p-4 rounded">
                        <h3 className="text-yellow-300 font-semibold">{spe.name}</h3>
                        <p className="text-gray-300 text-sm">{spe.description}</p>
                        <p className="text-gray-400 text-sm">Type: {spe.type}</p>
                        <p className="text-gray-500 text-sm">Level: {spe.level}</p>
                        <div className="flex gap-3 mt-2">
                            <button onClick={() => { setEditingSpellId(spe.id); setNewSpell(spe); }} className="text-green-400 hover:text-green-600">✎</button>
                            <button onClick={() => deleteSpell(spe.id)} className="text-red-400 hover:text-red-600">✕</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
