import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

export default function NPCs() {
    const [npcs, setNpcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newNpc, setNewNpc] = useState({
        name: '', role: '', description: '', hostility: false,
    });
    const [editingNpcId, setEditingNpcId] = useState(null);

    useEffect(() => { fetchNpcs(); }, []);

    const fetchNpcs = async () => {
        setLoading(true);
        try {
            const data = await api.getNpcs();
            setNpcs(data);
        } catch (err) {
            setError('Failed to load NPCs');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNpc(prev => ({ ...prev, [name]: value ?? ''}));
    };

    const saveNpc = async () => {
        try {
            const payload = {
                ...newNpc
            };
            const res = editingNpcId
                ? await api.updateNpc(editingNpcId, payload)
                : await api.createNpc(payload);
            await fetchNpcs();
            setNewNpc({ name: '', role: '', description: '', hostility: false});
            setEditingNpcId(null);
        } catch (err) {
            setError('Failed to save NPC');
        }
    };

    const deleteNpc = async (id) => {
        try {
            await api.deleteNpc(id);
            fetchNpcs();
        } catch {
            setError('Failed to delete NPC');
        }
    };

    if (loading) return <LoadingSpinner message="Loading NPCs..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchNpcs} />;

    return (
        <div className="p-4 space-y-6 text-white">
            <div className="bg-gray-700 p-4 rounded space-y-2">
                <h2 className="text-xl text-yellow-200">{editingNpcId ? 'Edit NPC' : 'Add New NPC'}</h2>
                {["name", "role", "description"].map(field => (
                    <input key={field} name={field} value={newNpc[field]} onChange={handleInputChange} placeholder={field}
                           className="w-full p-2 rounded bg-gray-600 text-white" />
                ))}
                <label className="flex items-center gap-2">
                    <input type="checkbox" name="hostility" checked={newNpc.hostility} onChange={handleInputChange} /> Hostile?
                </label>
                <button onClick={saveNpc} className="bg-yellow-600 px-4 py-1 rounded hover:bg-yellow-700">Save</button>
            </div>

            {loading ? (
                <p className="text-yellow-300">Loading NPCs...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <ul className="space-y-3">
                    {npcs.map(npc => (
                        <li key={npc.id} className="bg-gray-700 p-4 rounded">
                            <h3 className="text-yellow-300 font-semibold">{npc.name} {npc.hostility && <span className="text-red-500">(Hostile)</span>}</h3>
                            <p className="text-gray-300 text-sm">{npc.description}</p>
                            <p className="text-gray-300 text-sm">{npc.role}</p>
                            <div className="flex gap-3 mt-2">
                                <button onClick={() => { setEditingNpcId(npc.id); setNewNpc(
                                    {name: npc.name ?? '',
                                    role: npc.role ?? '',
                                    description: npc.description ?? '',
                                    hostility: npc.hostility ?? false}); }}
                                        className="text-green-400 hover:text-green-600">✎</button>
                                <button onClick={() => deleteNpc(npc.id)} className="text-red-400 hover:text-red-600">✕</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
