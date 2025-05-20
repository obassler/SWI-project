import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const races = [
    'Human', 'Elf', 'Dwarf', 'Half-Elf', 'Halfling', 'Gnome', 'Dragonborn', 'Half-Orc'
];

const classes = [
    'BARBARIAN', 'BARD', 'CLERIC', 'DRUID', 'FIGHTER',
    'MONK', 'PALADIN', 'RANGER', 'ROGUE', 'SORCERER',
    'WARLOCK', 'WIZARD'
];

export default function CharacterManager() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCharacter, setEditingCharacter] = useState(null);
    const [form, setForm] = useState({
        name: '',
        level: 1,
        race: 'Human',
        characterClass: 'BARBARIAN',
        currentHp: 10,
        maxHp: 10,
        status: 'Alive',
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        background: '',
        alignment: 'Neutral',
        specialization: '',
        notes: '',
        items: [],
        spells: [],
    });

    const [availableItems, setAvailableItems] = useState([]);
    const [availableSpells, setAvailableSpells] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [selectedSpellId, setSelectedSpellId] = useState('');

    useEffect(() => {
        loadCharacters();
        loadAvailableData();
    }, []);

    const loadCharacters = async () => {
        setLoading(true);
        try {
            const data = await api.getCharacters();
            setCharacters(data);
            setError(null);
        } catch (err) {
            setError('Failed to load characters');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableData = async () => {
        try {
            const items = await api.getItems();
            const spells = await api.getSpells();
            setAvailableItems(items);
            setAvailableSpells(spells);
        } catch (err) {
            console.error('Failed to load items/spells:', err);
        }
    };

    const startEditing = (char) => {
        setEditingCharacter(char);
        setForm({
            name: char.name || '',
            level: char.level || 1,
            race: char.race?.name || 'Human',
            characterClass: char.characterClass?.name || 'BARBARIAN',
            currentHp: char.currentHp || 10,
            maxHp: char.maxHp || 10,
            status: char.status || 'Alive',
            strength: char.strength || 10,
            dexterity: char.dexterity || 10,
            constitution: char.constitution || 10,
            intelligence: char.intelligence || 10,
            wisdom: char.wisdom || 10,
            charisma: char.charisma || 10,
            background: char.background || '',
            alignment: char.alignment || 'Neutral',
            specialization: char.specialization || '',
            notes: char.notes || '',
            items: char.items || [],
            spells: char.spells || [],
        });
    };

    const cancelEditing = () => {
        setEditingCharacter(null);
        resetForm();
    };

    const resetForm = () => {
        setForm({
            name: '',
            level: 1,
            race: 'Human',
            characterClass: 'BARBARIAN',
            currentHp: 10,
            maxHp: 10,
            status: 'Alive',
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
            background: '',
            alignment: 'Neutral',
            specialization: '',
            notes: '',
            items: [],
            spells: [],
        });
        setSelectedItemId('');
        setSelectedSpellId('');
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setForm(prev => ({
            ...prev,
            [name]: ['level', 'currentHp', 'maxHp', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(name)
                ? Math.max(0, parseInt(value, 10) || 0)
                : value,
        }));
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...form,
                race: {name: form.race},
                characterClass: {name: form.characterClass},
                items: form.items.map(item => item.id || item),
                spells: form.spells.map(spell => spell.id || spell),
            };

            console.log('Saving payload:', payload, 'Editing id:', editingCharacter?.id);

            if (editingCharacter) {
                await api.updateCharacter(editingCharacter.id, payload);
                alert('Character updated!');
            } else {
                await api.createCharacter(payload);
                alert('Character created!');
            }
            cancelEditing();
            loadCharacters();
        } catch (err) {
            alert('Failed to save character: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this character?')) return;
        try {
            await api.deleteCharacter(id);
            loadCharacters();
        } catch (err) {
            alert('Failed to delete character');
        }
    };

    const handleAddItem = async () => {
        if (!selectedItemId || !editingCharacter) return;
        try {
            await api.assignItemToCharacter(editingCharacter.id, selectedItemId);
            setSelectedItemId('');
            const updatedChar = await api.getCharacter(editingCharacter.id);
            startEditing(updatedChar);
        } catch (err) {
            alert('Failed to assign item: ' + err.message);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!editingCharacter) return;
        try {
            await api.removeItemFromCharacter(editingCharacter.id, itemId);
            const updatedChar = await api.getCharacter(editingCharacter.id);
            startEditing(updatedChar);
        } catch (err) {
            alert('Failed to remove item');
        }
    };

    const handleAddSpell = async () => {
        if (!selectedSpellId || !editingCharacter) return;
        try {
            await api.assignSpellToCharacter(editingCharacter.id, selectedSpellId);
            setSelectedSpellId('');
            const updatedChar = await api.getCharacter(editingCharacter.id);
            startEditing(updatedChar);
        } catch (err) {
            alert('Failed to assign spell');
        }
    };

    const handleRemoveSpell = async (spellId) => {
        if (!editingCharacter) return;
        try {
            await api.removeSpellFromCharacter(editingCharacter.id, spellId);
            const updatedChar = await api.getCharacter(editingCharacter.id);
            startEditing(updatedChar);
        } catch (err) {
            alert('Failed to remove spell');
        }
    };

    const handleStatusChange = (status) => {
        if (status === 'Dead') {
            setForm(prev => ({...prev, status, currentHp: 0}));
        } else {
            setForm(prev => ({...prev, status}));
        }
    };

    if (loading) return <LoadingSpinner message="Loading characters..."/>;
    if (error) return <ErrorMessage message={error} onRetry={loadCharacters}/>;

    return (
        <div
            className="max-w-7xl mx-auto p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-xl min-h-screen space-y-8"
        >
            <header>
                <h1 className="text-5xl font-extrabold text-yellow-400 tracking-wide drop-shadow-md">
                    Character Manager
                </h1>
            </header>

            {/* Character List */}
            <section aria-label="Character List">
                <ul className="space-y-3 max-h-96 overflow-y-auto">
                    {characters.length ? (
                        characters.map((char) => (
                            <li
                                key={char.id}
                                className="bg-gray-700 p-4 rounded flex justify-between items-center shadow-lg hover:bg-gray-600 transition"
                            >
                                <div>
                                    <span className="font-bold text-yellow-300">{char.name}</span> —{' '}
                                    {char.race?.name} {char.characterClass?.name} • Level {char.level}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => startEditing(char)}
                                        className="bg-yellow-400 text-gray-900 px-4 py-1 rounded hover:bg-yellow-500 transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(char.id)}
                                        className="bg-red-600 px-4 py-1 rounded hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-400 italic">No characters found.</p>
                    )}
                </ul>
            </section>

            {/* Character Form */}
            <section
                aria-label={editingCharacter ? 'Edit Character Form' : 'Create New Character Form'}
                className="bg-gray-700 rounded-lg p-6 shadow-lg max-w-5xl mx-auto"
            >
                <h2 className="text-3xl font-semibold mb-6 border-b border-yellow-400 pb-3">
                    {editingCharacter ? 'Edit Character' : 'Create New Character'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="space-y-4 col-span-1 md:col-span-1">
                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="name">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleInputChange}
                                className="w-full rounded bg-gray-600 p-2 text-white"
                                placeholder="Character name"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="level">
                                Level
                            </label>
                            <input
                                id="level"
                                name="level"
                                type="number"
                                min={1}
                                max={20}
                                value={form.level}
                                onChange={handleInputChange}
                                className="w-full rounded bg-gray-600 p-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="race">
                                Race
                            </label>
                            <select
                                id="race"
                                name="race"
                                value={form.race}
                                onChange={handleInputChange}
                                className="w-full rounded bg-gray-600 p-2 text-white"
                            >
                                {races.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="characterClass">
                                Class
                            </label>
                            <select
                                id="characterClass"
                                name="characterClass"
                                value={form.characterClass}
                                onChange={handleInputChange}
                                className="w-full rounded bg-gray-600 p-2 text-white"
                            >
                                {classes.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="status">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full rounded bg-gray-600 p-2 text-white"
                            >
                                <option>Alive</option>
                                <option>Dead</option>
                                <option>Injured</option>
                                <option>Unconscious</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="background">
                                Background
                            </label>
                            <input
                                id="background"
                                name="background"
                                value={form.background}
                                onChange={handleInputChange}
                                className="w-full rounded bg-gray-600 p-2 text-white"
                                placeholder="Character background"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="alignment">
                                Alignment
                            </label>
                            <input
                                id="alignment"
                                name="alignment"
                                value={form.alignment}
                                onChange={handleInputChange}
                                className="w-full rounded bg-gray-600 p-2 text-white"
                                placeholder="Alignment"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="specialization">
                                Specialization
                            </label>
                            <input
                                id="specialization"
                                name="specialization"
                                value={form.specialization}
                                onChange={handleInputChange}
                                className="w-full rounded bg-gray-600 p-2 text-white"
                                placeholder="Special skills or focus"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="notes">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={form.notes}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full rounded bg-gray-600 p-2 text-white"
                                placeholder="Additional info"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <h3 className="text-xl font-semibold border-b border-yellow-400 pb-2 mb-4">Stats</h3>
                        {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((stat) => (
                            <div key={stat}>
                                <label className="block mb-1 capitalize font-semibold" htmlFor={stat}>
                                    {stat}
                                </label>
                                <input
                                    id={stat}
                                    name={stat}
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={form[stat]}
                                    onChange={handleInputChange}
                                    className="w-full rounded bg-gray-600 p-2 text-white"
                                />
                            </div>
                        ))}

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                                <label className="block mb-1 font-semibold" htmlFor="currentHp">
                                    Current HP
                                </label>
                                <input
                                    id="currentHp"
                                    name="currentHp"
                                    type="number"
                                    min={0}
                                    max={form.maxHp}
                                    value={form.currentHp}
                                    onChange={handleInputChange}
                                    className="w-full rounded bg-gray-600 p-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold" htmlFor="maxHp">
                                    Max HP
                                </label>
                                <input
                                    id="maxHp"
                                    name="maxHp"
                                    type="number"
                                    min={1}
                                    max={999}
                                    value={form.maxHp}
                                    onChange={handleInputChange}
                                    className="w-full rounded bg-gray-600 p-2 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items & Spells */}
                    <div className="col-span-1 md:col-span-1 space-y-6">
                        <div className="bg-gray-800 rounded p-4 shadow-inner max-h-56 overflow-auto">
                            <h3 className="text-xl font-semibold border-b border-yellow-400 pb-2 mb-3">Items</h3>
                            <select
                                value={selectedItemId}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                                className="w-full rounded bg-gray-600 p-2 text-white mb-3"
                                aria-label="Select item to add"
                            >
                                <option value="">-- Select an item --</option>
                                {availableItems.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddItem}
                                disabled={!selectedItemId || !editingCharacter}
                                className={`w-full py-2 rounded ${
                                    selectedItemId && editingCharacter ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Add Item
                            </button>

                            <ul className="mt-4 space-y-1">
                                {form.items.length === 0 && <li className="text-gray-400 italic">No items assigned</li>}
                                {form.items.map((item) => (
                                    <li key={item.id} className="flex justify-between items-center">
                                        <span>{item.name}</span>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-red-500 hover:text-red-700 font-bold ml-3"
                                            title="Remove item"
                                            aria-label={`Remove item ${item.name}`}
                                        >
                                            &times;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gray-800 rounded p-4 shadow-inner max-h-56 overflow-auto">
                            <h3 className="text-xl font-semibold border-b border-yellow-400 pb-2 mb-3">Spells</h3>
                            <select
                                value={selectedSpellId}
                                onChange={(e) => setSelectedSpellId(e.target.value)}
                                className="w-full rounded bg-gray-600 p-2 text-white mb-3"
                                aria-label="Select spell to add"
                            >
                                <option value="">-- Select a spell --</option>
                                {availableSpells.map((spell) => (
                                    <option key={spell.id} value={spell.id}>
                                        {spell.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddSpell}
                                disabled={!selectedSpellId || !editingCharacter}
                                className={`w-full py-2 rounded ${
                                    selectedSpellId && editingCharacter ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Add Spell
                            </button>

                            <ul className="mt-4 space-y-1">
                                {form.spells.length === 0 &&
                                    <li className="text-gray-400 italic">No spells assigned</li>}
                                {form.spells.map((spell) => (
                                    <li key={spell.id} className="flex justify-between items-center">
                                        <span>{spell.name}</span>
                                        <button
                                            onClick={() => handleRemoveSpell(spell.id)}
                                            className="text-red-500 hover:text-red-700 font-bold ml-3"
                                            title="Remove spell"
                                            aria-label={`Remove spell ${spell.name}`}
                                        >
                                            &times;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button
                        onClick={handleSave}
                        className="bg-yellow-400 text-gray-900 px-8 py-3 rounded font-semibold hover:bg-yellow-500 transition"
                    >
                        Save
                    </button>
                    <button
                        onClick={cancelEditing}
                        className="bg-gray-600 px-8 py-3 rounded hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                </div>
            </section>
        </div>
    );
}

