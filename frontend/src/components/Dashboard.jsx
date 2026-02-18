import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

function HpBar({ current, max }) {
    const pct = max > 0 ? (current / max) * 100 : 0;
    const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full bg-gray-600 rounded h-4 overflow-hidden relative">
            <div className={`${color} h-full transition-all duration-300`} style={{ width: `${pct}%` }} />
            <span className="absolute inset-0 text-center text-xs text-white font-bold leading-4">
                {current}/{max}
            </span>
        </div>
    );
}

function StatWithBonus({ label, base, bonus }) {
    return (
        <span className="mr-3">
            {label} {base}
            {bonus > 0 && <span className="text-green-400"> +{bonus}</span>}
        </span>
    );
}

export default function Dashboard() {
    const [characters, setCharacters] = useState([]);
    const [locations, setLocations] = useState([]);
    const [quests, setQuests] = useState([]);
    const [selectedCharacterIds, setSelectedCharacterIds] = useState(() => {
        const saved = localStorage.getItem('selectedCharacterIds');
        const parsed = saved ? JSON.parse(saved) : [];
        return parsed.filter(id => id !== null && id !== undefined);
    });
    const [selectedLocationId, setSelectedLocationId] = useState(() => {
        const saved = localStorage.getItem('selectedLocationId');
        return saved ? parseInt(saved) : null;
    });
    const [combatMonsters, setCombatMonsters] = useState([]);
    const [hostileNpcIds, setHostileNpcIds] = useState([]);
    const [diceType, setDiceType] = useState('d20');
    const [diceModifier, setDiceModifier] = useState(0);
    const [damageInputs, setDamageInputs] = useState({});
    const [healInputs, setHealInputs] = useState({});
    const [monsterDamageInputs, setMonsterDamageInputs] = useState({});
    const [monsterHealInputs, setMonsterHealInputs] = useState({});
    const [combatLog, setCombatLog] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const logEndRef = useRef(null);

    const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setCombatLog(prev => [...prev, { timestamp, message }]);
    };

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [combatLog]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [charData, locData, questData] = await Promise.all([
                    api.getCharacters(),
                    api.getLocation(),
                    api.getQuests()
                ]);
                setCharacters(charData);
                setLocations(locData);
                setQuests(questData);
                if (selectedLocationId) {
                    const savedLoc = locData.find(loc => loc.id === selectedLocationId);
                    if (savedLoc) {
                        setCombatMonsters(expandMonsters(savedLoc));
                    }
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to load data');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('selectedCharacterIds', JSON.stringify(selectedCharacterIds));
    }, [selectedCharacterIds]);

    useEffect(() => {
        if (selectedLocationId !== null) {
            localStorage.setItem('selectedLocationId', selectedLocationId.toString());
        }
    }, [selectedLocationId]);

    const expandMonsters = (location) => {
        if (!location?.monstersInLocation) return [];
        let instanceId = 0;
        const instances = [];
        for (const mil of location.monstersInLocation) {
            for (let i = 0; i < mil.quantity; i++) {
                instanceId++;
                instances.push({
                    instanceId,
                    monster: mil.monster,
                    currentHp: mil.monster.health,
                    maxHp: mil.monster.health,
                    dead: false,
                    label: mil.quantity > 1 ? `${mil.monster.name} #${i + 1}` : mil.monster.name
                });
            }
        }
        return instances;
    };

    const handleCharacterSelect = (e) => {
        const id = parseInt(e.target.value);
        if (id && !selectedCharacterIds.includes(id) && selectedCharacterIds.length < 5) {
            setSelectedCharacterIds([...selectedCharacterIds, id]);
        }
    };

    const handleCharacterRemove = (id) => {
        setSelectedCharacterIds(prev => prev.filter(charId => charId !== id));
    };

    const handleLocationSelect = (e) => {
        const locId = parseInt(e.target.value);
        setSelectedLocationId(locId);
        const selectedLoc = locations.find(loc => loc.id === locId);
        setCombatMonsters(expandMonsters(selectedLoc));
        setHostileNpcIds([]);
        setMonsterDamageInputs({});
        setMonsterHealInputs({});
    };

    const toggleNpcHostility = (npcId) => {
        setHostileNpcIds(prev =>
            prev.includes(npcId) ? prev.filter(id => id !== npcId) : [...prev, npcId]
        );
    };

    const rollDice = () => {
        const max = parseInt(diceType.slice(1));
        const roll = Math.floor(Math.random() * max) + 1;
        const mod = parseInt(diceModifier) || 0;
        const total = roll + mod;
        const modStr = mod !== 0 ? ` ${mod >= 0 ? '+' : ''}${mod} = ${total}` : '';
        addLog(`Rolled ${diceType}: ${roll}${modStr}`);
    };

    const getEquippedBonuses = (character) => {
        const bonuses = { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 };
        if (!character.items) return bonuses;
        for (const item of character.items) {
            if (item.equipState) {
                bonuses.strength += item.strengthBonus || 0;
                bonuses.dexterity += item.dexterityBonus || 0;
                bonuses.constitution += item.constitutionBonus || 0;
                bonuses.intelligence += item.intelligenceBonus || 0;
                bonuses.wisdom += item.wisdomBonus || 0;
                bonuses.charisma += item.charismaBonus || 0;
            }
        }
        return bonuses;
    };

    const handleDamageCharacter = async (char) => {
        const amount = parseInt(damageInputs[char.id]) || 0;
        if (amount <= 0) return;
        try {
            const updated = await api.damageCharacter(char.id, amount);
            const oldHp = char.currentHp;
            setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
            setDamageInputs(prev => ({ ...prev, [char.id]: '' }));
            const deadStr = updated.currentHp === 0 ? ', DEAD' : '';
            addLog(`Dealt ${amount} damage to ${char.name} (HP: ${oldHp}\u2192${updated.currentHp}${deadStr})`);
        } catch (err) {
            setError(`Failed to damage character: ${err.message}`);
        }
    };

    const handleHealCharacter = async (char) => {
        const amount = parseInt(healInputs[char.id]) || 0;
        if (amount <= 0) return;
        try {
            const updated = await api.healCharacterAmount(char.id, amount);
            const oldHp = char.currentHp;
            setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
            setHealInputs(prev => ({ ...prev, [char.id]: '' }));
            addLog(`Healed ${char.name} for ${amount} HP (HP: ${oldHp}\u2192${updated.currentHp})`);
        } catch (err) {
            setError(`Failed to heal character: ${err.message}`);
        }
    };

    const handleDamageMonster = (instanceId) => {
        const amount = parseInt(monsterDamageInputs[instanceId]) || 0;
        if (amount <= 0) return;
        setCombatMonsters(prev => prev.map(m => {
            if (m.instanceId !== instanceId) return m;
            const oldHp = m.currentHp;
            const newHp = Math.max(0, m.currentHp - amount);
            const dead = newHp === 0;
            const deadStr = dead && !m.dead ? ', DEAD' : '';
            addLog(`Dealt ${amount} damage to ${m.label} (HP: ${oldHp}\u2192${newHp}${deadStr})`);
            return { ...m, currentHp: newHp, dead };
        }));
        setMonsterDamageInputs(prev => ({ ...prev, [instanceId]: '' }));
    };

    const handleHealMonster = (instanceId) => {
        const amount = parseInt(monsterHealInputs[instanceId]) || 0;
        if (amount <= 0) return;
        setCombatMonsters(prev => prev.map(m => {
            if (m.instanceId !== instanceId) return m;
            const oldHp = m.currentHp;
            const newHp = Math.min(m.maxHp, m.currentHp + amount);
            const wasRevived = m.dead && newHp > 0;
            addLog(`Healed ${m.label} for ${amount} HP (HP: ${oldHp}\u2192${newHp}${wasRevived ? ', REVIVED' : ''})`);
            return { ...m, currentHp: newHp, dead: newHp === 0 };
        }));
        setMonsterHealInputs(prev => ({ ...prev, [instanceId]: '' }));
    };

    const handleEquipToggle = async (character, item) => {
        try {
            const newState = !item.equipState;
            await api.equipItem(character.id, item.id, newState);
            setCharacters(prev => prev.map(c => {
                if (c.id !== character.id) return c;
                return {
                    ...c,
                    items: c.items.map(i => i.id === item.id ? { ...i, equipState: newState } : i)
                };
            }));
            addLog(`${newState ? 'Equipped' : 'Unequipped'} ${item.name} on ${character.name}`);
        } catch (err) {
            setError(`Failed to toggle equip state: ${err.message}`);
        }
    };

    const healParty = async () => {
        if (selectedCharacterIds.length === 0) return;
        try {
            const healed = await api.healParty(selectedCharacterIds);
            setCharacters(prev =>
                prev.map(c => {
                    const healedChar = healed.find(h => h.id === c.id);
                    return healedChar || c;
                })
            );
            addLog(`Long Rest: Fully healed ${healed.length} party member(s)`);
        } catch (err) {
            setError(`Failed to heal party: ${err.message}`);
        }
    };

    const shortRest = async () => {
        if (selectedCharacterIds.length === 0) return;
        try {
            const selected = characters.filter(c => selectedCharacterIds.includes(c.id));
            const results = await Promise.all(
                selected.map(c => {
                    const healAmount = Math.floor(c.maxHp / 2);
                    return api.healCharacterAmount(c.id, healAmount);
                })
            );
            setCharacters(prev =>
                prev.map(c => {
                    const updated = results.find(r => r.id === c.id);
                    return updated || c;
                })
            );
            addLog(`Short Rest: Healed ${results.length} party member(s) for half max HP`);
        } catch (err) {
            setError(`Failed to short rest: ${err.message}`);
        }
    };

    const handleCompleteQuest = async (quest) => {
        try {
            const updated = await api.completeQuest(quest.id);
            setQuests(prev => prev.map(q => q.id === updated.id ? updated : q));
            addLog(`Quest completed: "${quest.title}"`);
        } catch (err) {
            setError(`Failed to complete quest: ${err.message}`);
        }
    };

    const selectedCharacters = characters.filter(char => selectedCharacterIds.includes(char.id));
    const selectedLocation = locations.find(l => l.id === selectedLocationId);
    const npcsInLocation = selectedLocation?.npcs || [];
    const aliveMonsters = combatMonsters.filter(m => !m.dead).length;
    const deadMonsters = combatMonsters.filter(m => m.dead).length;

    const partyQuestIds = new Set();
    selectedCharacters.forEach(c => {
        if (c.quests) c.quests.forEach(q => partyQuestIds.add(q.id));
    });
    const activeQuests = quests.filter(q => !q.completion && partyQuestIds.has(q.id));
    const completedQuests = quests.filter(q => q.completion && partyQuestIds.has(q.id));
    const availableQuests = quests.filter(q => !q.completion && !partyQuestIds.has(q.id));

    if (loading) return <LoadingSpinner message="Loading dashboard..." />;
    if (error && !characters.length) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

    return (
        <div className="p-4 space-y-4 text-white">
            {error && <ErrorMessage message={error} />}

            <div className="flex flex-wrap items-center gap-4 bg-gray-800 p-3 rounded">
                <h1 className="text-2xl font-bold text-yellow-300">DM Control Panel</h1>
                <div className="flex items-center gap-2 ml-auto">
                    <select
                        value={diceType}
                        onChange={(e) => setDiceType(e.target.value)}
                        className="bg-gray-600 text-white p-1 rounded text-sm"
                    >
                        {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={diceModifier}
                        onChange={(e) => setDiceModifier(e.target.value)}
                        className="w-14 p-1 bg-gray-600 text-white rounded text-sm text-center"
                        placeholder="mod"
                    />
                    <button onClick={rollDice} className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700 text-sm font-semibold">
                        Roll
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded">
                        <h2 className="text-lg text-yellow-200 mb-2 font-semibold">Party (max 5)</h2>
                        <select onChange={handleCharacterSelect} value="" className="w-full p-2 bg-gray-600 text-white rounded mb-3">
                            <option value="">Add character to party...</option>
                            {characters.map(char => (
                                <option
                                    key={char.id}
                                    value={char.id}
                                    disabled={selectedCharacterIds.includes(char.id)}
                                >
                                    {char.name} - Lvl {char.level} {char.characterClass?.name}
                                </option>
                            ))}
                        </select>

                        <div className="space-y-3">
                            {selectedCharacters.map((char) => {
                                const bonuses = getEquippedBonuses(char);
                                const isDead = char.currentHp === 0 || char.status === 'Dead';
                                return (
                                    <div key={char.id} className={`bg-gray-800 p-3 rounded ${isDead ? 'opacity-60' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <span className="font-bold text-white">{char.name}</span>
                                                <span className="text-gray-400 text-sm ml-2">
                                                    {char.race?.name} {char.characterClass?.name} Lvl {char.level}
                                                </span>
                                                {isDead && <span className="text-red-400 text-sm ml-2 font-bold">DEAD</span>}
                                            </div>
                                            <button
                                                onClick={() => handleCharacterRemove(char.id)}
                                                className="text-red-400 hover:text-red-300 text-sm px-1"
                                            >
                                                &#10005;
                                            </button>
                                        </div>

                                        <HpBar current={char.currentHp} max={char.maxHp} />

                                        <div className="text-xs text-gray-300 mt-2 flex flex-wrap">
                                            <StatWithBonus label="STR" base={char.strength} bonus={bonuses.strength} />
                                            <StatWithBonus label="DEX" base={char.dexterity} bonus={bonuses.dexterity} />
                                            <StatWithBonus label="CON" base={char.constitution} bonus={bonuses.constitution} />
                                            <StatWithBonus label="INT" base={char.intelligence} bonus={bonuses.intelligence} />
                                            <StatWithBonus label="WIS" base={char.wisdom} bonus={bonuses.wisdom} />
                                            <StatWithBonus label="CHA" base={char.charisma} bonus={bonuses.charisma} />
                                        </div>

                                        {char.items && char.items.length > 0 && (
                                            <div className="mt-2">
                                                <div className="text-xs text-gray-400 mb-1">Items:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {char.items.map(item => {
                                                        const equippable = ['WEAPON','ARMOR','SHIELD','RING','AMULET','CLOTHING']
                                                            .includes(item.type?.toUpperCase());
                                                        return equippable ? (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => handleEquipToggle(char, item)}
                                                                className={`text-xs px-2 py-0.5 rounded ${
                                                                    item.equipState
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-600 text-gray-300'
                                                                } hover:opacity-80 cursor-pointer`}
                                                                title={item.equipState ? 'Click to unequip' : 'Click to equip'}
                                                            >
                                                                {item.name} {item.equipState ? '[E]' : ''}
                                                            </button>
                                                        ) : (
                                                            <span
                                                                key={item.id}
                                                                className="text-xs px-2 py-0.5 rounded bg-gray-600 text-gray-400 italic"
                                                                title={item.description || item.type}
                                                            >
                                                                {item.name}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-2">
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={damageInputs[char.id] || ''}
                                                    onChange={(e) => setDamageInputs(prev => ({ ...prev, [char.id]: e.target.value }))}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleDamageCharacter(char)}
                                                    className="w-16 p-1 bg-gray-700 text-white rounded text-xs"
                                                    placeholder="dmg"
                                                />
                                                <button
                                                    onClick={() => handleDamageCharacter(char)}
                                                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-xs"
                                                >
                                                    Damage
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={healInputs[char.id] || ''}
                                                    onChange={(e) => setHealInputs(prev => ({ ...prev, [char.id]: e.target.value }))}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleHealCharacter(char)}
                                                    className="w-16 p-1 bg-gray-700 text-white rounded text-xs"
                                                    placeholder="heal"
                                                />
                                                <button
                                                    onClick={() => handleHealCharacter(char)}
                                                    className="px-2 py-1 bg-green-600 rounded hover:bg-green-700 text-xs"
                                                >
                                                    Heal
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedCharacters.length > 0 && (
                            <div className="flex gap-2 mt-3">
                                <button onClick={healParty} className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 text-sm">
                                    Long Rest
                                </button>
                                <button onClick={shortRest} className="px-3 py-1 bg-teal-600 rounded hover:bg-teal-700 text-sm">
                                    Short Rest
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedCharacterIds([]);
                                        localStorage.removeItem('selectedCharacterIds');
                                    }}
                                    className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm ml-auto"
                                >
                                    Unselect All
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded">
                        <h2 className="text-lg text-yellow-200 mb-2 font-semibold">Location & Encounter</h2>
                        <select
                            value={selectedLocationId || ''}
                            onChange={handleLocationSelect}
                            className="w-full p-2 bg-gray-600 text-white rounded mb-3"
                        >
                            <option value="" disabled>Select a location</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>

                        {selectedLocation && (
                            <p className="text-sm text-gray-300 mb-3">
                                <span className="text-yellow-300">Description:</span> {selectedLocation.description}
                            </p>
                        )}

                        {combatMonsters.length > 0 && (
                            <div>
                                <h3 className="text-yellow-200 font-semibold text-sm mb-2">
                                    Monsters ({aliveMonsters} alive, {deadMonsters} dead)
                                </h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {combatMonsters.map(m => (
                                        <div
                                            key={m.instanceId}
                                            className={`bg-gray-800 p-2 rounded ${m.dead ? 'opacity-40' : ''}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-sm font-semibold ${m.dead ? 'line-through text-gray-500' : m.monster.boss ? 'text-red-400' : 'text-white'}`}>
                                                    {m.label} {m.monster.boss ? '(BOSS)' : ''}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    ATK {m.monster.attack} | DEF {m.monster.defense}
                                                </span>
                                            </div>
                                            <HpBar current={m.currentHp} max={m.maxHp} />
                                            <div className="flex items-center gap-1 mt-1">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={monsterDamageInputs[m.instanceId] || ''}
                                                    onChange={(e) => setMonsterDamageInputs(prev => ({ ...prev, [m.instanceId]: e.target.value }))}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleDamageMonster(m.instanceId)}
                                                    className="w-16 p-1 bg-gray-700 text-white rounded text-xs"
                                                    placeholder="dmg"
                                                />
                                                <button
                                                    onClick={() => handleDamageMonster(m.instanceId)}
                                                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-xs"
                                                >
                                                    Dmg
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={monsterHealInputs[m.instanceId] || ''}
                                                    onChange={(e) => setMonsterHealInputs(prev => ({ ...prev, [m.instanceId]: e.target.value }))}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleHealMonster(m.instanceId)}
                                                    className="w-16 p-1 bg-gray-700 text-white rounded text-xs"
                                                    placeholder="heal"
                                                />
                                                <button
                                                    onClick={() => handleHealMonster(m.instanceId)}
                                                    className="px-2 py-1 bg-green-600 rounded hover:bg-green-700 text-xs"
                                                >
                                                    Heal
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedLocation && npcsInLocation.length > 0 && (
                        <div className="bg-gray-700 p-4 rounded">
                            <h2 className="text-lg text-yellow-200 mb-2 font-semibold">NPCs in Location</h2>
                            <div className="space-y-2">
                                {npcsInLocation.map(npc => (
                                    <div key={npc.id} className="bg-gray-800 p-2 rounded flex justify-between items-center">
                                        <div>
                                            <strong>{npc.name}</strong>
                                            <span className="text-gray-400 text-sm ml-2">{npc.role}</span>
                                            {npc.description && <div className="text-xs text-gray-400 italic">"{npc.description}"</div>}
                                        </div>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hostileNpcIds.includes(npc.id)}
                                                onChange={() => toggleNpcHostility(npc.id)}
                                            />
                                            Hostile
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedCharacters.length > 0 && quests.length > 0 && (
                <div className="bg-gray-700 p-3 rounded">
                    <h2 className="text-sm text-yellow-200 font-semibold mb-2">Quests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activeQuests.map(q => (
                            <div key={q.id} className="bg-gray-800 px-3 py-2 rounded text-sm flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-yellow-300">{q.title}</span>
                                        <span className="text-xs text-gray-500">{q.type}</span>
                                    </div>
                                    {q.description && <p className="text-xs text-gray-400 mt-0.5">{q.description}</p>}
                                    {q.participants && q.participants.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {q.participants.map(p => p.name).join(', ')}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleCompleteQuest(q)}
                                    className="px-2 py-0.5 bg-green-600 rounded hover:bg-green-700 text-xs whitespace-nowrap shrink-0"
                                >
                                    Complete
                                </button>
                            </div>
                        ))}
                        {completedQuests.map(q => (
                            <div key={q.id} className="bg-gray-800 px-3 py-2 rounded text-sm opacity-50">
                                <span className="line-through">{q.title}</span>
                                <span className="text-xs text-gray-500 ml-2">{q.type}</span>
                            </div>
                        ))}
                        {availableQuests.map(q => (
                            <div key={q.id} className="bg-gray-800 px-3 py-2 rounded text-sm text-gray-500 border border-gray-600 border-dashed">
                                <span>{q.title}</span>
                                <span className="text-xs text-gray-600 ml-2">{q.type}</span>
                                {q.description && <p className="text-xs text-gray-600 mt-0.5">{q.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg text-yellow-200 font-semibold">Combat Log</h2>
                    <button
                        onClick={() => setCombatLog([])}
                        className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 text-xs"
                    >
                        Clear Log
                    </button>
                </div>
                <div className="bg-gray-900 rounded p-3 max-h-48 overflow-y-auto font-mono text-sm">
                    {combatLog.length === 0 ? (
                        <p className="text-gray-500 italic">No actions yet. Roll dice, deal damage, or heal to see entries here.</p>
                    ) : (
                        combatLog.map((entry, i) => (
                            <div key={i} className="text-gray-300 py-0.5">
                                <span className="text-gray-500">[{entry.timestamp}]</span> {entry.message}
                            </div>
                        ))
                    )}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    );
}
