import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { getModifier, formatModifier, getProficiencyBonus, D5E_CONDITIONS, parseSpellSlots, resetSpellSlots } from '../dndUtils';
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

function StatBlock({ label, base, bonus }) {
    const total = base + bonus;
    const mod = getModifier(total);
    return (
        <span className="mr-2 text-xs">
            {label} {base}{bonus > 0 && <span className="text-green-400">+{bonus}</span>}
            <span className="text-yellow-300 ml-0.5">({formatModifier(mod)})</span>
        </span>
    );
}

function DeathSaves({ character, onSave }) {
    const successes = character.deathSaveSuccesses || 0;
    const failures = character.deathSaveFailures || 0;
    return (
        <div className="mt-2 p-2 bg-gray-900 rounded border border-red-800">
            <div className="text-xs font-semibold text-red-400 mb-1">Death Saving Throws</div>
            <div className="flex items-center gap-3 text-xs">
                <div>
                    <span className="text-green-400 mr-1">Pass:</span>
                    {[0, 1, 2].map(i => (
                        <span key={i} className={i < successes ? 'text-green-400' : 'text-gray-600'}>{i < successes ? '\u25C9' : '\u25CB'} </span>
                    ))}
                </div>
                <div>
                    <span className="text-red-400 mr-1">Fail:</span>
                    {[0, 1, 2].map(i => (
                        <span key={i} className={i < failures ? 'text-red-400' : 'text-gray-600'}>{i < failures ? '\u25C9' : '\u25CB'} </span>
                    ))}
                </div>
                <button onClick={() => onSave(character.id, true)} className="px-2 py-0.5 bg-green-700 rounded hover:bg-green-600 text-xs">Pass</button>
                <button onClick={() => onSave(character.id, false)} className="px-2 py-0.5 bg-red-700 rounded hover:bg-red-600 text-xs">Fail</button>
            </div>
        </div>
    );
}

function SpellSlotTracker({ character, onUseSlot, onRestoreSlot }) {
    const slots = parseSpellSlots(character.spellSlots);
    const levels = Object.keys(slots).sort((a, b) => Number(a) - Number(b));
    if (levels.length === 0) return null;

    return (
        <div className="mt-2">
            <div className="text-xs text-gray-400 mb-1">Spell Slots:</div>
            <div className="flex flex-wrap gap-1">
                {levels.map(level => {
                    const { max, used } = slots[level];
                    if (max === 0) return null;
                    const remaining = max - (used || 0);
                    return (
                        <div key={level} className="flex items-center gap-0.5 bg-gray-900 px-1.5 py-0.5 rounded text-xs">
                            <span className="text-purple-300 mr-1">{level}:</span>
                            {Array.from({ length: max }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => i < remaining ? onUseSlot(character.id, level) : onRestoreSlot(character.id, level)}
                                    className={`w-3 h-3 rounded-full border ${i < remaining ? 'bg-purple-500 border-purple-400 hover:bg-purple-700' : 'bg-gray-700 border-gray-500 hover:bg-purple-900'}`}
                                    title={i < remaining ? 'Click to use slot' : 'Click to restore slot'}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ConditionBadges({ character, onToggle }) {
    const conditions = character.conditions || [];
    const [showPicker, setShowPicker] = useState(false);
    const available = D5E_CONDITIONS.filter(c => !conditions.includes(c));

    return (
        <div className="mt-1">
            <div className="flex flex-wrap gap-1 items-center">
                {conditions.map(c => (
                    <button key={c} onClick={() => onToggle(character.id, c, false)}
                        className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-200 hover:bg-red-700" title="Click to remove">
                        {c} \u00d7
                    </button>
                ))}
                <button onClick={() => setShowPicker(!showPicker)}
                    className="text-xs px-1.5 py-0.5 rounded bg-gray-600 text-gray-300 hover:bg-gray-500">
                    {showPicker ? '\u2212' : '+'}
                </button>
            </div>
            {showPicker && available.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {available.map(c => (
                        <button key={c} onClick={() => { onToggle(character.id, c, true); setShowPicker(false); }}
                            className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">
                            {c}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function InitiativeTracker({ entries, currentTurn, onNext, onPrev, onClear }) {
    if (entries.length === 0) return null;
    return (
        <div className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm text-yellow-200 font-semibold">Initiative Order</h2>
                <div className="flex gap-1">
                    <button onClick={onPrev} className="px-2 py-0.5 bg-gray-600 rounded hover:bg-gray-500 text-xs">&larr; Prev</button>
                    <button onClick={onNext} className="px-2 py-0.5 bg-yellow-600 rounded hover:bg-yellow-700 text-xs">Next &rarr;</button>
                    <button onClick={onClear} className="px-2 py-0.5 bg-red-600 rounded hover:bg-red-700 text-xs">Clear</button>
                </div>
            </div>
            <div className="flex flex-wrap gap-1">
                {entries.map((entry, i) => (
                    <div key={entry.key} className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        i === currentTurn ? 'bg-yellow-600 text-black font-bold' :
                        entry.dead ? 'bg-gray-800 text-gray-500 line-through opacity-50' :
                        entry.type === 'character' ? 'bg-blue-900 text-blue-200' : 'bg-red-900 text-red-200'
                    }`}>
                        <span className="font-mono">{entry.initiative}</span>
                        <span>{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
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
    const [initiativeEntries, setInitiativeEntries] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(0);
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
                    api.getLocations(),
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
        setInitiativeEntries([]);
        setCurrentTurn(0);
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

    const rollInitiative = () => {
        const entries = [];
        const selected = characters.filter(c => selectedCharacterIds.includes(c.id));
        for (const char of selected) {
            const bonuses = getEquippedBonuses(char);
            const dexMod = getModifier(char.dexterity + bonuses.dexterity);
            const roll = Math.floor(Math.random() * 20) + 1;
            entries.push({
                key: `char-${char.id}`,
                id: char.id,
                name: char.name,
                type: 'character',
                initiative: roll + dexMod,
                roll,
                modifier: dexMod,
                dead: char.currentHp === 0 || char.status === 'DECEASED'
            });
        }
        for (const m of combatMonsters) {
            if (m.dead) continue;
            const roll = Math.floor(Math.random() * 20) + 1;
            entries.push({
                key: `mon-${m.instanceId}`,
                instanceId: m.instanceId,
                name: m.label,
                type: 'monster',
                initiative: roll,
                roll,
                modifier: 0,
                dead: false
            });
        }
        entries.sort((a, b) => b.initiative - a.initiative);
        setInitiativeEntries(entries);
        setCurrentTurn(0);
        entries.forEach(e => {
            const modStr = e.modifier !== 0 ? ` (${formatModifier(e.modifier)})` : '';
            addLog(`Initiative: ${e.name} rolled ${e.roll}${modStr} = ${e.initiative}`);
        });
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

    const handleDeathSave = async (charId, success) => {
        try {
            const updated = await api.deathSave(charId, success);
            setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
            const char = characters.find(c => c.id === charId);
            const result = success ? 'SUCCESS' : 'FAILURE';
            addLog(`Death Save for ${char?.name}: ${result} (${updated.deathSaveSuccesses}/3 pass, ${updated.deathSaveFailures}/3 fail)`);
            if (updated.deathSaveSuccesses >= 3) addLog(`${char?.name} stabilized!`);
            if (updated.deathSaveFailures >= 3) addLog(`${char?.name} has died.`);
        } catch (err) {
            setError(`Failed to save death save: ${err.message}`);
        }
    };

    const handleConditionToggle = async (charId, condition, add) => {
        const char = characters.find(c => c.id === charId);
        if (!char) return;
        const current = new Set(char.conditions || []);
        if (add) current.add(condition); else current.delete(condition);
        try {
            const updated = await api.updateConditions(charId, Array.from(current));
            setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
            addLog(`${add ? 'Applied' : 'Removed'} ${condition} ${add ? 'to' : 'from'} ${char.name}`);
        } catch (err) {
            setError(`Failed to update conditions: ${err.message}`);
        }
    };

    const handleUseSpellSlot = async (charId, level) => {
        const char = characters.find(c => c.id === charId);
        if (!char) return;
        const slots = parseSpellSlots(char.spellSlots);
        if (!slots[level]) return;
        const remaining = slots[level].max - (slots[level].used || 0);
        if (remaining <= 0) return;
        slots[level].used = (slots[level].used || 0) + 1;
        try {
            const updated = await api.updateSpellSlots(charId, slots);
            setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
            addLog(`${char.name} used a level ${level} spell slot (${slots[level].max - slots[level].used}/${slots[level].max} remaining)`);
        } catch (err) {
            setError(`Failed to update spell slots: ${err.message}`);
        }
    };

    const handleRestoreSpellSlot = async (charId, level) => {
        const char = characters.find(c => c.id === charId);
        if (!char) return;
        const slots = parseSpellSlots(char.spellSlots);
        if (!slots[level] || (slots[level].used || 0) <= 0) return;
        slots[level].used = slots[level].used - 1;
        try {
            const updated = await api.updateSpellSlots(charId, slots);
            setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
        } catch (err) {
            setError(`Failed to update spell slots: ${err.message}`);
        }
    };

    const healParty = async () => {
        if (selectedCharacterIds.length === 0) return;
        try {
            const healed = await api.healParty(selectedCharacterIds);
            const selected = characters.filter(c => selectedCharacterIds.includes(c.id));
            for (const char of selected) {
                if (char.spellSlots) {
                    const resetSlots = resetSpellSlots(char.spellSlots);
                    try { await api.updateSpellSlots(char.id, JSON.parse(resetSlots)); } catch {}
                }
                if (char.conditions && char.conditions.length > 0) {
                    try { await api.updateConditions(char.id, []); } catch {}
                }
            }
            const refreshed = await api.getCharacters();
            setCharacters(refreshed);
            addLog(`Long Rest: Fully healed ${healed.length} party member(s), restored spell slots, cleared conditions`);
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
                    {selectedCharacters.length > 0 && combatMonsters.length > 0 && (
                        <button onClick={rollInitiative} className="px-3 py-1 bg-orange-600 rounded hover:bg-orange-700 text-sm font-semibold">
                            Roll Initiative
                        </button>
                    )}
                </div>
            </div>

            <InitiativeTracker
                entries={initiativeEntries}
                currentTurn={currentTurn}
                onNext={() => setCurrentTurn(prev => (prev + 1) % initiativeEntries.length)}
                onPrev={() => setCurrentTurn(prev => (prev - 1 + initiativeEntries.length) % initiativeEntries.length)}
                onClear={() => { setInitiativeEntries([]); setCurrentTurn(0); }}
            />

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
                                const isDead = char.currentHp === 0 || char.status === 'DECEASED';
                                const isUnconscious = char.currentHp === 0 && char.status !== 'DECEASED';
                                const profBonus = getProficiencyBonus(char.level);
                                return (
                                    <div key={char.id} className={`bg-gray-800 p-3 rounded ${isDead ? 'opacity-60' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <span className="font-bold text-white">{char.name}</span>
                                                <span className="text-gray-400 text-sm ml-2">
                                                    {char.race?.name} {char.characterClass?.name} Lvl {char.level}
                                                </span>
                                                <span className="text-xs ml-2 text-blue-300">AC {char.armorClass || 10}</span>
                                                <span className="text-xs ml-1 text-yellow-400">Prof {formatModifier(profBonus)}</span>
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
                                            <StatBlock label="STR" base={char.strength} bonus={bonuses.strength} />
                                            <StatBlock label="DEX" base={char.dexterity} bonus={bonuses.dexterity} />
                                            <StatBlock label="CON" base={char.constitution} bonus={bonuses.constitution} />
                                            <StatBlock label="INT" base={char.intelligence} bonus={bonuses.intelligence} />
                                            <StatBlock label="WIS" base={char.wisdom} bonus={bonuses.wisdom} />
                                            <StatBlock label="CHA" base={char.charisma} bonus={bonuses.charisma} />
                                        </div>

                                        <ConditionBadges character={char} onToggle={handleConditionToggle} />

                                        <SpellSlotTracker character={char} onUseSlot={handleUseSpellSlot} onRestoreSlot={handleRestoreSpellSlot} />

                                        {isUnconscious && (
                                            <DeathSaves character={char} onSave={handleDeathSave} />
                                        )}

                                        {char.items && char.items.length > 0 && (
                                            <div className="mt-2">
                                                <div className="text-xs text-gray-400 mb-1">Items:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {char.items.map(item => {
                                                        const equippable = ['WEAPON','ARMOR','SHIELD','RING','AMULET','CLOTHING']
                                                            .includes(item.type?.toUpperCase?.() || item.type);
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
                                                    AC {m.monster.armorClass || 10} | ATK {m.monster.attack} | DEF {m.monster.defense}
                                                    {m.monster.challengeRating && ` | CR ${m.monster.challengeRating}`}
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
