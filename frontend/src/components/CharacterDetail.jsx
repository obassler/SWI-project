import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getModifier, formatModifier, getProficiencyBonus, XP_THRESHOLDS, D5E_CONDITIONS, D5E_SKILLS, parseSpellSlots, serializeSpellSlots } from '../dndUtils';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const STAT_BONUS_MAP = {
    strength: 'strengthBonus',
    dexterity: 'dexterityBonus',
    constitution: 'constitutionBonus',
    intelligence: 'intelligenceBonus',
    wisdom: 'wisdomBonus',
    charisma: 'charismaBonus',
};

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
                spells: data.spells || [],
                conditions: data.conditions || [],
                skillProficiencies: data.skillProficiencies || [],
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
        }
    };

    const handleAddSpell = async () => {
        if (!selectedSpellId) return;
        try {
            await api.assignSpellToCharacter(character.id, selectedSpellId);
            setSelectedSpellId('');
            await fetchCharacter();
        } catch (err) {
            alert("Failed to assign spell: " + (err.message || 'Unknown error'));
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await api.removeItemFromCharacter(character.id, itemId);
            await fetchCharacter();
        } catch (err) {
            alert("Failed to remove item: " + (err.message || 'Unknown error'));
        }
    };

    const handleRemoveSpell = async (spellId) => {
        try {
            await api.removeSpellFromCharacter(character.id, spellId);
            await fetchCharacter();
        } catch (err) {
            alert("Failed to remove spell: " + (err.message || 'Unknown error'));
        }
    };

    const handleStatusChange = (status) => {
        if (status === 'DECEASED') {
            setCharacter(prevState => ({ ...prevState, status, currentHp: 0 }));
        } else {
            setCharacter(prevState => ({ ...prevState, status }));
        }
    };

    const toggleSkillProficiency = (skillName) => {
        setCharacter(prev => {
            const current = new Set(prev.skillProficiencies || []);
            if (current.has(skillName)) current.delete(skillName); else current.add(skillName);
            return { ...prev, skillProficiencies: Array.from(current) };
        });
    };

    const toggleCondition = (condition) => {
        setCharacter(prev => {
            const current = new Set(prev.conditions || []);
            if (current.has(condition)) current.delete(condition); else current.add(condition);
            return { ...prev, conditions: Array.from(current) };
        });
    };

    const updateSpellSlotMax = (level, value) => {
        const slots = parseSpellSlots(character.spellSlots);
        const max = Math.max(0, parseInt(value) || 0);
        slots[level] = { max, used: slots[level]?.used || 0 };
        if (max === 0) delete slots[level];
        setCharacter(prev => ({ ...prev, spellSlots: serializeSpellSlots(slots) }));
    };

    const getStatBonuses = (stat) => {
        const bonusField = STAT_BONUS_MAP[stat];
        const bonuses = [];
        (character.items || []).forEach(item => {
            if (item.equipState && item[bonusField] && item[bonusField] > 0) {
                bonuses.push({ name: item.name, value: item[bonusField] });
            }
        });
        return bonuses;
    };

    const getTotalBonus = (stat) => {
        return getStatBonuses(stat).reduce((sum, b) => sum + b.value, 0);
    };

    useEffect(() => {
        fetchCharacter();
        fetchAvailableData();
    }, [id]);

    if (loading) return <LoadingSpinner message="Loading character..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchCharacter} />;
    if (!character) return null;

    const profBonus = getProficiencyBonus(character.level);
    const currentXp = character.experiencePoints || 0;
    const nextLevelXp = character.level < 20 ? XP_THRESHOLDS[character.level] : null;
    const spellSlots = parseSpellSlots(character.spellSlots);

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
                        <option value="Tiefling">Tiefling</option>
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
                <div className="text-gray-300 mb-4 flex flex-wrap gap-3 items-center">
                    <span>{character.race.name} {character.characterClass.name} &bull; Level {character.level}</span>
                    <span className="text-blue-300">AC {character.armorClass || 10}</span>
                    <span className="text-yellow-400">Proficiency {formatModifier(profBonus)}</span>
                    <span className="text-purple-300">XP {currentXp.toLocaleString()}{nextLevelXp ? ` / ${nextLevelXp.toLocaleString()}` : ' (MAX)'}</span>
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
                            <>
                                <select
                                    value={character.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="p-2 bg-gray-600 text-white rounded w-full mb-2"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="REVIVED">Revived</option>
                                    <option value="DECEASED">Deceased</option>
                                </select>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-400">Armor Class</label>
                                        <input type="number" value={character.armorClass || 10}
                                            onChange={(e) => setCharacter({ ...character, armorClass: parseInt(e.target.value) || 0 })}
                                            className="p-2 bg-gray-600 text-white rounded w-full" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">Experience Points</label>
                                        <input type="number" value={character.experiencePoints || 0}
                                            onChange={(e) => setCharacter({ ...character, experiencePoints: parseInt(e.target.value) || 0 })}
                                            className="p-2 bg-gray-600 text-white rounded w-full" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-300">Status: {character.status}</p>
                        )}
                    </div>

                    <div className="bg-gray-700 p-4 rounded">
                        <h2 className="text-lg font-semibold text-yellow-200 mb-2">Abilities</h2>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                            {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => {
                                const bonuses = getStatBonuses(stat);
                                const totalBonus = getTotalBonus(stat);
                                const total = (character[stat] || 10) + totalBonus;
                                const mod = getModifier(total);
                                return (
                                    <div key={stat} className="flex flex-col">
                                        <div className="flex justify-between items-center">
                                            <span className="capitalize font-semibold">{stat.slice(0, 3)}:</span>
                                            {editing ? (
                                                <input
                                                    type="number"
                                                    value={character[stat] || 10}
                                                    onChange={(e) => setCharacter({ ...character, [stat]: parseInt(e.target.value) || 0 })}
                                                    className="p-1 bg-gray-600 text-white rounded w-16"
                                                />
                                            ) : (
                                                <span>
                                                    {character[stat] || 10}
                                                    {totalBonus > 0 && (
                                                        <span className="text-green-400"> + {totalBonus}</span>
                                                    )}
                                                    <span className="text-yellow-300 ml-1">({formatModifier(mod)})</span>
                                                </span>
                                            )}
                                        </div>
                                        {!editing && bonuses.length > 0 && (
                                            <div className="text-xs text-green-400 ml-2">
                                                {bonuses.map((b, i) => (
                                                    <span key={i}>{b.name} (+{b.value}){i < bonuses.length - 1 ? ', ' : ''}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {(editing || (character.conditions && character.conditions.length > 0)) && (
                    <div className="bg-gray-700 p-4 rounded">
                        <h2 className="text-lg font-semibold text-yellow-200 mb-2">Conditions</h2>
                        <div className="flex flex-wrap gap-2">
                            {D5E_CONDITIONS.map(c => {
                                const active = (character.conditions || []).includes(c);
                                return (
                                    <button key={c}
                                        onClick={() => editing && toggleCondition(c)}
                                        className={`text-xs px-2 py-1 rounded ${
                                            active ? 'bg-red-700 text-red-100' : editing ? 'bg-gray-600 text-gray-400 hover:bg-gray-500' : 'hidden'
                                        } ${!editing && active ? 'cursor-default' : ''}`}
                                        disabled={!editing}
                                    >
                                        {c}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="bg-gray-700 p-4 rounded">
                    <h2 className="text-lg font-semibold text-yellow-200 mb-2">Skills</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-sm">
                        {D5E_SKILLS.map(skill => {
                            const proficient = (character.skillProficiencies || []).includes(skill.name);
                            const abilityScore = character[skill.ability] || 10;
                            const totalBonus = getTotalBonus(skill.ability);
                            const mod = getModifier(abilityScore + totalBonus);
                            const skillMod = proficient ? mod + profBonus : mod;
                            return (
                                <div key={skill.name} className="flex items-center gap-1">
                                    {editing ? (
                                        <input type="checkbox" checked={proficient}
                                            onChange={() => toggleSkillProficiency(skill.name)}
                                            className="w-3 h-3" />
                                    ) : (
                                        <span className={`w-3 text-center ${proficient ? 'text-green-400' : 'text-gray-600'}`}>
                                            {proficient ? '\u25C9' : '\u25CB'}
                                        </span>
                                    )}
                                    <span className={`text-xs ${proficient ? 'text-green-300' : 'text-gray-400'}`}>
                                        {formatModifier(skillMod)} {skill.name}
                                    </span>
                                    <span className="text-xs text-gray-600">({skill.ability.slice(0, 3).toUpperCase()})</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                    <h2 className="text-lg font-semibold text-yellow-200 mb-2">Spell Slots</h2>
                    <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                        {[1,2,3,4,5,6,7,8,9].map(level => {
                            const slot = spellSlots[level] || { max: 0, used: 0 };
                            return (
                                <div key={level} className="text-center">
                                    <div className="text-xs text-gray-400 mb-1">Lvl {level}</div>
                                    {editing ? (
                                        <input type="number" min="0" max="9"
                                            value={slot.max}
                                            onChange={(e) => updateSpellSlotMax(level, e.target.value)}
                                            className="w-full p-1 bg-gray-600 text-white rounded text-xs text-center" />
                                    ) : (
                                        <div className="flex justify-center gap-0.5">
                                            {slot.max > 0 ? Array.from({ length: slot.max }, (_, i) => (
                                                <span key={i} className={`w-3 h-3 rounded-full inline-block ${
                                                    i < slot.max - (slot.used || 0) ? 'bg-purple-500' : 'bg-gray-600'
                                                }`} />
                                            )) : <span className="text-gray-600 text-xs">-</span>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                                    >&#10005; Remove</button>
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
                                <span>{spell.name} <span className="text-gray-500 text-xs">Lvl {spell.level} {spell.type}</span></span>
                                {editing && (
                                    <button
                                        onClick={() => handleRemoveSpell(spell.id)}
                                        className="text-red-400 hover:text-red-600 text-xs"
                                    >&#10005; Remove</button>
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
