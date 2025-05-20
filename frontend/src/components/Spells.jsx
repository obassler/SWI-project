import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Spells() {
    const [spells, setSpells] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: '',
        level: 1
    });
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingSpellId, setEditingSpellId] = useState(null);

    useEffect(() => {
        fetchSpells();
    }, []);

    const fetchSpells = async () => {
        setLoading(true);
        setError(null);
        try {
            const spellData = await api.getSpells();
            setSpells(spellData || []);
        } catch (err) {
            console.error('Error fetching spells:', err);
            setError('Failed to load spells');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'level' ? parseInt(value) : value
        }));
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', type: '', level: 1 });
        setEditingSpellId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitLoading(true);

        try {
            if (!formData.name || !formData.description || !formData.type || !formData.level) {
                throw new Error('All fields are required');
            }

            console.log(`Submitting spell data:`, formData);
            console.log(`Editing mode: ${editingSpellId ? 'Update' : 'Create'}`);

            if (editingSpellId) {
                await api.updateSpell(editingSpellId, formData);
                console.log(`Spell ${editingSpellId} updated successfully`);
            } else {
                const newSpell = await api.createSpell(formData);
                console.log(`New spell created:`, newSpell);
            }

            await fetchSpells();
            resetForm();
        } catch (err) {
            console.error('Error saving spell:', err);
            setError(`Failed to save spell: ${err.message || 'Please try again'}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (spell) => {
        console.log(`Editing spell:`, spell);
        setFormData({
            name: spell.name,
            description: spell.description,
            type: spell.type,
            level: spell.level
        });
        setEditingSpellId(spell.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this spell?')) {
            return;
        }

        setError(null);
        try {
            console.log(`Attempting to delete spell ${id}`);
            await api.deleteSpell(id);
            console.log(`Spell ${id} deleted successfully`);
            await fetchSpells();
        } catch (err) {
            console.error('Error deleting spell:', err);
            setError(`Failed to delete spell: ${err.message || 'Please try again'}`);
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={() => {
                    if (editingSpellId) {
                        setEditingSpellId(null);
                        setFormData({ name: '', role: '', description: '', level: 1 });
                    }
                    setShowForm(!showForm);
                }}
                className="mb-4 px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
                {showForm ? (editingSpellId ? 'Cancel Edit' : 'Hide Form') : 'Create New Spell'}
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
                    <div>
                        <label className="block text-gray-300 mb-1">Type</label>
                        <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            maxLength="25"
                            required
                            className="w-full p-2 bg-gray-600 text-white rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Level (1–9)</label>
                        <input
                            type="number"
                            name="level"
                            value={formData.level}
                            onChange={handleInputChange}
                            min="1"
                            max="9"
                            required
                            className="w-full p-2 bg-gray-600 text-white rounded"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={submitLoading}
                            className={`px-4 py-2 bg-green-600 rounded hover:bg-green-700 ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {submitLoading
                                ? (editingSpellId ? 'Updating...' : 'Creating...')
                                : (editingSpellId ? 'Update Spell' : 'Create Spell')}
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

            {loading ? (
                <p className="text-yellow-300">Loading spells...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : spells.length === 0 ? (
                <p className="text-gray-400">No spells found.</p>
            ) : (
                <div>
                    <p className="mb-2 text-sm text-gray-400">Total spells: {spells.length}</p>
                    <ul className="space-y-2 text-sm text-gray-200">
                        {spells.map(spell => (
                            <li key={spell.id} className="bg-gray-800 p-3 rounded">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <strong>{spell.name}</strong> – {spell.type}
                                        {spell.description && (
                                            <div className="text-xs text-gray-400 italic">"{spell.description}"</div>
                                        )}
                                        <div className="text-xs text-gray-400">Level: {spell.level} | ID: {spell.id}</div>
                                    </div>
                                    <div className="flex gap-3 text-lg">
                                        <button
                                            onClick={() => handleEdit(spell)}
                                            className="text-green-400 hover:text-green-600"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => handleDelete(spell.id)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}