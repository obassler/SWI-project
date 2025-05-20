import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function NPCs() {
    const [npcs, setNpcs] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        description: '',
        hostility: false
    });
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingNpcId, setEditingNpcId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNpcs();
    }, []);

    const fetchNpcs = async () => {
        try {
            const npcData = await api.getNpcs();
            setNpcs(npcData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load NPCs');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitLoading(true);

        try {
            if (editingNpcId) {
                await api.updateNpc(editingNpcId, formData);
                setEditingNpcId(null);
            } else {
                const newNPC = await api.createNpc(formData);
                setNpcs(prev => [...prev, newNPC]);
            }

            setFormData({ name: '', role: '', description: '', hostility: false });
            setShowForm(false);
            await fetchNpcs();
        } catch (err) {
            console.error('Error saving NPC:', err);
            setError('Failed to save NPC. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (npc) => {
        setFormData({
            name: npc.name,
            role: npc.role,
            description: npc.description,
            hostility: npc.hostility
        });
        setEditingNpcId(npc.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteNpc(id);
            await fetchNpcs();
        } catch (err) {
            console.error('Error deleting NPC:', err);
            setError('Failed to delete NPC');
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={() => {
                    if (editingNpcId) {
                        setEditingNpcId(null);
                        setFormData({ name: '', role: '', description: '', hostility: false });
                    }
                    setShowForm(!showForm);
                }}
                className="mb-4 px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
                {showForm ? (editingNpcId ? 'Cancel Edit' : 'Hide Form') : 'Create New NPC'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-700 p-6 rounded space-y-4 mb-6">
                    <div>
                        <label className="block text-gray-300 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            maxLength="25"
                            required
                            className="w-full p-2 bg-gray-600 text-white rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Role</label>
                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            maxLength="25"
                            required
                            className="w-full p-2 bg-gray-600 text-white rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            maxLength="200"
                            required
                            className="w-full p-2 bg-gray-600 text-white rounded"
                            rows="4"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="hostility"
                            checked={formData.hostility}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-yellow-600"
                        />
                        <label className="text-gray-300">Hostile</label>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={submitLoading}
                            className={`px-4 py-2 bg-green-600 rounded hover:bg-green-700 ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {submitLoading ? (editingNpcId ? 'Updating...' : 'Creating...') : (editingNpcId ? 'Update NPC' : 'Create NPC')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingNpcId(null);
                                setFormData({ name: '', role: '', description: '', hostility: false });
                            }}
                            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </form>
            )}

            {loading ? (
                <p className="text-yellow-300">Loading NPCs...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : npcs.length === 0 ? (
                <p className="text-gray-400">No NPCs found.</p>
            ) : (
                <ul className="space-y-2 text-sm text-gray-200">
                    {npcs.map(npc => (
                        <li key={npc.id} className="bg-gray-800 p-3 rounded">
                            <div className="flex justify-between items-start">
                                <div>
                                    <strong>{npc.name}</strong> – {npc.role}
                                    {npc.description && (
                                        <div className="text-xs text-gray-400 italic">"{npc.description}"</div>
                                    )}
                                    <div className="text-xs text-gray-400">
                                        Hostility: {npc.hostility ? 'Hostile' : 'Non-hostile'}
                                    </div>
                                </div>
                                <div className="flex gap-3 text-lg">
                                    <button onClick={() => handleEdit(npc)} className="text-green-400 hover:text-green-600">✎</button>
                                    <button onClick={() => handleDelete(npc.id)} className="text-red-400 hover:text-red-600">✕</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
