import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

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

    useEffect(() => {
        fetchNpcs();
    }, []);

    const fetchNpcs = async () => {
        setLoading(true);
        try {
            const npcData = await api.getNpcs();
            setNpcs(npcData);
        } catch (err) {
            setError('Failed to load NPCs');
        } finally {
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

    const resetForm = () => {
        setFormData({ name: '', role: '', description: '', hostility: false });
        setEditingNpcId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitLoading(true);

        try {
            if (editingNpcId) {
                await api.updateNpc(editingNpcId, formData);
            } else {
                await api.createNpc(formData);
            }
            resetForm();
            await fetchNpcs();
        } catch (err) {
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
            setError('Failed to delete NPC');
        }
    };

    if (loading) return <LoadingSpinner message="Loading NPCs..." />;
    if (error && !npcs.length) return <ErrorMessage message={error} onRetry={fetchNpcs} />;

    return (
        <div className="p-4 space-y-6 text-white">
            <button
                onClick={() => {
                    if (editingNpcId) {
                        setEditingNpcId(null);
                        setFormData({ name: '', role: '', description: '', hostility: false });
                    }
                    setShowForm(!showForm);
                }}
                className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
                {showForm ? (editingNpcId ? 'Cancel Edit' : 'Hide Form') : 'Create New NPC'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-700 p-4 rounded space-y-4">
                    <h2 className="text-xl text-yellow-200">{editingNpcId ? 'Edit NPC' : 'Add New NPC'}</h2>
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
                            onClick={resetForm}
                            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </form>
            )}

            {error && npcs.length > 0 && <ErrorMessage message={error} onRetry={fetchNpcs} />}

            {npcs.length === 0 ? (
                <p className="text-gray-400">No NPCs found.</p>
            ) : (
                <ul className="space-y-3">
                    {npcs.map(npc => (
                        <li key={npc.id} className="bg-gray-800 p-4 rounded">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-yellow-300 font-semibold">{npc.name}</h3>
                                    <p className="text-gray-400 text-sm">Role: {npc.role}</p>
                                    {npc.description && (
                                        <p className="text-gray-300 text-sm">{npc.description}</p>
                                    )}
                                    <p className="text-sm">
                                        {npc.hostility
                                            ? <span className="text-red-400">Hostile</span>
                                            : <span className="text-green-400">Non-hostile</span>
                                        }
                                    </p>
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
