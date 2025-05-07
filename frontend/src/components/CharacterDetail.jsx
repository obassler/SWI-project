import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function CharacterDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [availableItems, setAvailableItems] = useState([]);
    const [availableSpells, setAvailableSpells] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [selectedSpellId, setSelectedSpellId] = useState('');

    const fetchCharacter = async () => {
        setLoading(true);
        try {
            const data = await api.getCharacter(id);
            setCharacter({
                ...data,
                race: data.race || { name: 'Unknown' },
                characterClass: data.characterClass || { name: 'Unknown' },
                items: data.items || [],
                spells: data.spells || []
            });
        } catch (err) {
            setError('Failed to load character');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableData = async () => {
        try {
            const items = await api.getItems();
            const spells = await api.getSpells();
            setAvailableItems(items);
            setAvailableSpells(spells);
        } catch (err) {
            console.error('Failed to load item/spell list:', err);
        }
    };

    useEffect(() => {
        fetchCharacter();
        fetchAvailableData();
    }, [id]);

    const handleAddItem = async () => {
        if (!selectedItemId) return;
        try {
            await api.assignItemToCharacter(character.id, selectedItemId);
            setSelectedItemId('');
            await fetchCharacter();
        } catch (err) {
            alert("Failed to assign item: " + err.response?.data || err.message);
            console.error('Failed to assign item:', err);
        }
    };


    const handleAddSpell = async () => {
        if (!selectedSpellId) return;
        try {
            await api.assignSpellToCharacter(character.id, selectedSpellId);
            setSelectedSpellId('');
            await fetchCharacter();
        } catch (err) {
            console.error('Failed to assign spell:', err);
        }
    };

    if (loading) return <LoadingSpinner message="Loading character..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchCharacter} />;
    if (!character) return null;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
            <h1 className="text-3xl font-bold text-yellow-300 mb-2">{character.name}</h1>
            <p className="text-gray-300 mb-4">
                {character.race.name} {character.characterClass.name} • Level {character.level}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded">
                    <h2 className="text-lg font-semibold text-yellow-400 mb-2">HP & Status</h2>
                    <p>HP: {character.currentHp} / {character.maxHp}</p>
                    <p>Status: {character.status}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded">
                    <h2 className="text-lg font-semibold text-yellow-400 mb-2">Abilities</h2>
                    <ul className="grid grid-cols-2 gap-x-4">
                        <li>STR: {character.strength}</li>
                        <li>DEX: {character.dexterity}</li>
                        <li>CON: {character.constitution}</li>
                        <li>INT: {character.intelligence}</li>
                        <li>WIS: {character.wisdom}</li>
                        <li>CHA: {character.charisma}</li>
                    </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded">
                    <h2 className="text-lg font-semibold text-yellow-400 mb-2">Details</h2>
                    <p><strong>Background:</strong> {character.background || 'None'}</p>
                    <p><strong>Alignment:</strong> {character.alignment || 'Unknown'}</p>
                    <p><strong>Specialization:</strong> {character.specialization || 'None'}</p>
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded mb-6">
                <h2 className="text-lg font-semibold text-yellow-400 mb-2">Notes</h2>
                <p className="whitespace-pre-wrap">{character.notes || 'No notes provided.'}</p>
            </div>

            {/* Inventory Section */}
            <div className="bg-gray-800 p-4 rounded mb-6">
                <h2 className="text-xl font-semibold text-yellow-300 mb-3">Inventory ({character.items.length})</h2>
                <ul className="space-y-2 mb-4">
                    {character.items.map(item => (
                        <li key={item.id} className="bg-gray-700 p-2 rounded">
                            <strong>{item.name}</strong>
                            {item.equipState && <span className="ml-2 text-green-400">[Equipped]</span>}
                            <div className="text-sm text-gray-400">{item.description}</div>
                        </li>
                    ))}
                </ul>
                <div className="flex gap-2 items-center">
                    <select
                        value={selectedItemId}
                        onChange={e => setSelectedItemId(e.target.value)}
                        className="p-2 bg-gray-700 text-white rounded"
                    >
                        <option value="">-- Select Item --</option>
                        {availableItems.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                    <button onClick={handleAddItem} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Add Item</button>
                </div>
            </div>

            {/* Spells Section */}
            <div className="bg-gray-800 p-4 rounded mb-6">
                <h2 className="text-xl font-semibold text-yellow-300 mb-3">Spells ({character.spells.length})</h2>
                <ul className="space-y-2 mb-4">
                    {character.spells.map(spell => (
                        <li key={spell.id} className="bg-gray-700 p-2 rounded">{spell.name}</li>
                    ))}
                </ul>
                <div className="flex gap-2 items-center">
                    <select
                        value={selectedSpellId}
                        onChange={e => setSelectedSpellId(e.target.value)}
                        className="p-2 bg-gray-700 text-white rounded"
                    >
                        <option value="">-- Select Spell --</option>
                        {availableSpells.map(spell => (
                            <option key={spell.id} value={spell.id}>{spell.name}</option>
                        ))}
                    </select>
                    <button onClick={handleAddSpell} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Add Spell</button>
                </div>
            </div>

            <div className="mt-6">
                <Link to="/" className="text-blue-400 hover:underline">← Back to Dashboard</Link>
            </div>
        </div>
    );
}