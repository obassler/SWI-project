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
    const [editing, setEditing] = useState(false);
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
                name: data.name || 'Unnamed Character',
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

    const handleSaveCharacter = async () => {
        try {
            const updatedCharacter = {
                ...character,
                name: character.name || 'Unnamed Character',
                race: { name: character.race.name },
                characterClass: { name: character.characterClass.name }
            };
            await api.updateCharacter(character.id, updatedCharacter);
            alert("Character updated successfully");
            setEditing(false);
            await fetchCharacter();
        } catch (err) {
            console.error('Failed to update character:', err);
            alert("Failed to update character: " + err.message);
        }
    };

    const handleAddItem = async () => {
        if (!selectedItemId) return;
        try {
            await api.assignItemToCharacter(character.id, selectedItemId);
            setSelectedItemId('');
            await fetchCharacter();
        } catch (err) {
            alert("Failed to assign item: " + (err.message || 'Unknown error'));
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

    const handleRemoveItem = async (itemId) => {
        try {
            await api.removeItemFromCharacter(character.id, itemId);
            await fetchCharacter();
        } catch (err) {
            console.error("Failed to remove item:", err);
        }
    };

    const handleRemoveSpell = async (spellId) => {
        try {
            await api.removeSpellFromCharacter(character.id, spellId);
            await fetchCharacter();
        } catch (err) {
            console.error("Failed to remove spell:", err);
        }
    };

    const handleStatusChange = (status) => {
        if (status === 'Dead') {
            setCharacter(prevState => ({
                ...prevState,
                status,
                currentHp: 0
            }));
        } else {
            setCharacter(prevState => ({
                ...prevState,
                status
            }));
        }
    };

    useEffect(() => {
        fetchCharacter();
        fetchAvailableData();
    }, [id]);

    if (loading) return <LoadingSpinner message="Loading character..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchCharacter} />;
    if (!character) return null;

    return (
        <div className="space-y-6 p-4 max-w-5xl mx-auto bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-2xl text-white min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {editing ? (
                    <input
                        type="text"
                        value={character.name}
                        onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                        className="p-2 bg-gray-700 text-white rounded text-2xl font-bold w-full sm:w-auto text-yellow-200"
                    />
                ) : (
                    <h1 className="text-3xl font-bold text-yellow-300">{character.name}</h1>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditing(!editing)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                    >
                        {editing ? 'Cancel' : 'Edit'}
                    </button>
                    {editing && (
                        <button
                            onClick={handleSaveCharacter}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>

            {editing ? (
                <div className="text-gray-300 mb-4 flex flex-col sm:flex-row gap-4">
                    <select
                        value={character.race.name}
                        onChange={(e) => setCharacter({ ...character, race: { name: e.target.value } })}
                        className="p-2 bg-gray-700 text-white rounded w-full sm:w-auto"
                    >
                        <option value="Human">Human</option>
                        <option value="Elf">Elf</option>
                        <option value="Dwarf">Dwarf</option>
                        <option value="Half-Elf">Half-Elf</option>
                        <option value="Halfling">Halfling</option>
                        <option value="Gnome">Gnome</option>
                        <option value="Dragonborn">Dragonborn</option>
                        <option value="Half-Orc">Half-Orc</option>
                    </select>
                    <select
                        value={character.characterClass.name}
                        onChange={(e) => setCharacter({ ...character, characterClass: { name: e.target.value } })}
                        className="p-2 bg-gray-700 text-white rounded w-full sm:w-auto"
                    >
                        <option value="BARBARIAN">BARBARIAN</option>
                        <option value="BARD">BARD</option>
                        <option value="CLERIC">CLERIC</option>
                        <option value="DRUID">DRUID</option>
                        <option value="FIGHTER">FIGHTER</option>
                        <option value="MONK">MONK</option>
                        <option value="PALADIN">PALADIN</option>
                        <option value="RANGER">RANGER</option>
                        <option value="ROGUE">ROGUE</option>
                        <option value="SORCERER">SORCERER</option>
                        <option value="WARLOCK">WARLOCK</option>
                        <option value="WIZARD">WIZARD</option>
                    </select>
                </div>
            ) : (
                <div className="text-gray-300 mb-4">
                    {character.race.name} {character.characterClass.name} • Level {character.level}
                </div>
            )}

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded">
                        <h2 className="text-lg font-semibold text-yellow-200 mb-2">HP & Status</h2>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="number"
                                value={character.currentHp}
                                onChange={(e) => setCharacter({ ...character, currentHp: parseInt(e.target.value) || 0 })}
                                className="p-2 bg-gray-600 text-white rounded w-full"
                                disabled={!editing}
                            />
                            <span className="text-gray-300">/</span>
                            <input
                                type="number"
                                value={character.maxHp}
                                onChange={(e) => setCharacter({ ...character, maxHp: parseInt(e.target.value) || 0 })}
                                className="p-2 bg-gray-600 text-white rounded w-full"
                                disabled={!editing}
                            />
                        </div>
                        {editing ? (
                            <select
                                value={character.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="p-2 bg-gray-600 text-white rounded w-full"
                            >
                                <option value="Alive">Alive</option>
                                <option value="Dead">Dead</option>
                            </select>
                        ) : (
                            <p className="text-gray-300">Status: {character.status}</p>
                        )}
                    </div>

                    <div className="bg-gray-700 p-4 rounded">
                        <h2 className="text-lg font-semibold text-yellow-200 mb-2">Abilities</h2>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                            {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => (
                                <div key={stat} className="flex justify-between">
                                    <span className="capitalize">{stat.slice(0, 3)}:</span>
                                    {editing ? (
                                        <input
                                            type="number"
                                            value={character[stat] || 10}
                                            onChange={(e) => setCharacter({ ...character, [stat]: parseInt(e.target.value) || 0 })}
                                            className="p-1 bg-gray-600 text-white rounded w-16"
                                        />
                                    ) : (
                                        <span>{character[stat] || 10}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded">
                        <h2 className="text-lg font-semibold text-yellow-200 mb-2">Details</h2>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p>
                                <strong>Background:</strong>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={character.background || ''}
                                        onChange={(e) => setCharacter({ ...character, background: e.target.value })}
                                        className="p-2 bg-gray-600 text-white rounded w-full"
                                    />
                                ) : (
                                    <span> {character.background || 'None'}</span>
                                )}
                            </p>
                            <p>
                                <strong>Alignment:</strong>
                                {editing ? (
                                    <select
                                        value={character.alignment || 'Neutral'}
                                        onChange={(e) => setCharacter({ ...character, alignment: e.target.value })}
                                        className="p-2 bg-gray-600 text-white rounded w-full"
                                    >
                                        <option value="Lawful Good">Lawful Good</option>
                                        <option value="Neutral Good">Neutral Good</option>
                                        <option value="Chaotic Good">Chaotic Good</option>
                                        <option value="Lawful Neutral">Lawful Neutral</option>
                                        <option value="Neutral">Neutral</option>
                                        <option value="Chaotic Neutral">Chaotic Neutral</option>
                                        <option value="Lawful Evil">Lawful Evil</option>
                                        <option value="Neutral Evil">Neutral Evil</option>
                                        <option value="Chaotic Evil">Chaotic Evil</option>
                                    </select>
                                ) : (
                                    <span> {character.alignment || 'Unknown'}</span>
                                )}
                            </p>
                            <p>
                                <strong>Specialization:</strong>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={character.specialization || ''}
                                        onChange={(e) => setCharacter({ ...character, specialization: e.target.value })}
                                        className="p-2 bg-gray-600 text-white rounded w-full"
                                    />
                                ) : (
                                    <span> {character.specialization || 'None'}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-700 p-4 rounded">
                        <h2 className="text-xl font-semibold text-yellow-200 mb-2">Notes</h2>
                        <textarea
                            value={character.notes || ''}
                            onChange={(e) => setCharacter({ ...character, notes: e.target.value })}
                            className="w-full p-2 bg-gray-600 text-white rounded"
                            rows="5"
                            placeholder="Add your notes here..."
                            disabled={!editing}
                        ></textarea>
                    </div>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                    <h2 className="text-xl font-semibold text-yellow-200 mb-2">Inventory ({character.items.length})</h2>
                    <ul className="space-y-2 mb-4 text-sm text-gray-200">
                        {character.items.map(item => (
                            <li key={item.id} className="bg-gray-800 p-2 rounded flex justify-between items-center">
                                <div>
                                    <strong>{item.name}</strong>
                                    {item.equipState && <span className="ml-2 text-green-400">[Equipped]</span>}
                                    <div className="text-xs text-gray-400">{item.description}</div>
                                </div>
                                {editing && (
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-red-400 hover:text-red-600 text-xs"
                                    >✕ Remove</button>
                                )}
                            </li>
                        ))}
                    </ul>
                    {editing && (
                        <div className="flex gap-2 items-center">
                            <select
                                key={selectedItemId || 'item-select'}
                                value={selectedItemId}
                                onChange={e => setSelectedItemId(e.target.value)}
                                className="p-2 bg-gray-600 text-white rounded flex-1"
                            >
                                <option value="">Select Item</option>
                                {availableItems.map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddItem}
                                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                                disabled={!selectedItemId}
                            >Add Item</button>
                        </div>
                    )}
                </div>

                <div className="bg-gray-700 p-4 rounded">
                    <h2 className="text-xl font-semibold text-yellow-200 mb-2">Spells ({character.spells.length})</h2>
                    <ul className="space-y-2 mb-4 text-sm text-gray-200">
                        {character.spells.map(spell => (
                            <li key={spell.id} className="bg-gray-800 p-2 rounded flex justify-between items-center">
                                <span>{spell.name}</span>
                                {editing && (
                                    <button
                                        onClick={() => handleRemoveSpell(spell.id)}
                                        className="text-red-400 hover:text-red-600 text-xs"
                                    >✕ Remove</button>
                                )}
                            </li>
                        ))}
                    </ul>
                    {editing && (
                        <div className="flex gap-2 items-center">
                            <select
                                key={selectedSpellId || 'spell-select'}
                                value={selectedSpellId}
                                onChange={e => setSelectedSpellId(e.target.value)}
                                className="p-2 bg-gray-600 text-white rounded flex-1"
                            >
                                <option value="">Select Spell</option>
                                {availableSpells.map(spell => (
                                    <option key={spell.id} value={spell.id}>{spell.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddSpell}
                                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                                disabled={!selectedSpellId}
                            >Add Spell</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
