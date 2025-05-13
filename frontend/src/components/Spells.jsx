import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSpells = async () => {
            try {
                const spellData = await api.getSpells();
                setSpells(spellData || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching spells:', err);
                setError('Failed to load spells');
                setLoading(false);
            }
        };
        fetchSpells();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'level' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitLoading(true);

        console.log('Form data being submitted:', formData);

        try {
            // Check if all fields are filled
            if (!formData.name || !formData.description || !formData.type || !formData.level) {
                throw new Error('All fields are required');
            }

            // Call the API to create the spell
            const newSpell = await api.createSpell({
                name: formData.name,
                description: formData.description,
                type: formData.type,
                level: formData.level
            });

            if (newSpell) {
                console.log('Spell created successfully:', newSpell);

                // Update spells list with the new spell
                setSpells(prev => [...prev, newSpell]);

                // Reset form data
                setFormData({
                    name: '',
                    description: '',
                    type: '',
                    level: 1
                });
                setShowForm(false);
            } else {
                throw new Error('Failed to create spell');
            }
        } catch (err) {
            console.error('Error creating spell:', err);
            setError(`Failed to create spell: ${err.message || 'Please try again'}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={() => setShowForm(!showForm)}
                className="mb-4 px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
                {showForm ? 'Hide Create Form' : 'Create New Spell'}
            </button>
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-700 p-6 rounded space-y-4 mb-6">
                    <div>
                        <label className="block text-gray-300 mb-1">Name (max 25 characters)</label>
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
                        <label className="block text-gray-300 mb-1">Description (max 200 characters)</label>
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
                        <label className="block text-gray-300 mb-1">Type (max 25 characters)</label>
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
                        <label className="block text-gray-300 mb-1">Level (1-9)</label>
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
                            {submitLoading ? 'Creating...' : 'Create Spell'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
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
                <ul className="space-y-2 text-sm text-gray-200">
                    {spells.map(spell => (
                        <li key={spell.id} className="bg-gray-800 p-2 rounded">
                            <strong>{spell.name}</strong> – {spell.type}
                            {spell.description && (
                                <div className="text-xs text-gray-400 italic">"{spell.description}"</div>
                            )}
                            <div className="text-xs text-gray-400">Level: {spell.level}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}