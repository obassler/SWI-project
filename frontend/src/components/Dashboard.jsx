import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [characters, setCharacters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [quests, setQuests] = useState([]);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState(() => {
    const saved = localStorage.getItem('selectedCharacterIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedLocationId, setSelectedLocationId] = useState(() => {
    const saved = localStorage.getItem('selectedLocationId');
    return saved ? parseInt(saved) : null;
  });
  const [combatMonsters, setCombatMonsters] = useState([]);
  const [hostileNpcIds, setHostileNpcIds] = useState([]);
  const [diceResult, setDiceResult] = useState(null);
  const [diceType, setDiceType] = useState('d20');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charData, locData, questData] = await Promise.all([
          api.getCharacters(),
          api.getLocation(),
          api.getQuests(),
        ]);
        setCharacters(charData);
        setLocations(locData);
        setQuests(questData);

        if (selectedLocationId) {
          const selectedLoc = locData.find(loc => loc.id === selectedLocationId);
          setCombatMonsters(selectedLoc?.monstersInLocation || []);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLocationId]);


  useEffect(() => {
    localStorage.setItem('selectedCharacterIds', JSON.stringify(selectedCharacterIds));
  }, [selectedCharacterIds]);

  useEffect(() => {
    if (selectedLocationId !== null) {
      localStorage.setItem('selectedLocationId', selectedLocationId);
    }
  }, [selectedLocationId]);

  // Load quests from localStorage if available
  useEffect(() => {
    const savedQuests = localStorage.getItem('quests');
    if (savedQuests) {
      setQuests(JSON.parse(savedQuests));
    }
  }, []);

  const handleCharacterSelect = (e) => {
    const id = parseInt(e.target.value);
    if (!selectedCharacterIds.includes(id) && selectedCharacterIds.length < 5) {
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
    setCombatMonsters(selectedLoc?.monstersInLocation || []);
    setHostileNpcIds([]);
  };

  const toggleNpcHostility = (npcId) => {
    setHostileNpcIds(prev =>
        prev.includes(npcId) ? prev.filter(id => id !== npcId) : [...prev, npcId]
    );
  };

  const rollDice = () => {
    const max = parseInt(diceType.slice(1));
    const result = Math.floor(Math.random() * max) + 1;
    setDiceResult(`Rolled a ${diceType}: ${result}`);
  };

  const healParty = () => {
    const healed = characters.map(c =>
        selectedCharacterIds.includes(c.id) ? { ...c, currentHp: c.maxHp } : c
    );
    setCharacters(healed);
    localStorage.setItem('characters', JSON.stringify(healed));
  };

  useEffect(() => {
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
  }, []);

  const handleQuestCompletion = (questId) => {
    const updatedQuests = quests.map((quest) =>
        quest.id === questId ? { ...quest, completion: true } : quest
    );
    setQuests(updatedQuests);
    localStorage.setItem('quests', JSON.stringify(updatedQuests));
  };


  useEffect(() => {
    const savedQuests = localStorage.getItem('quests');
    if (savedQuests) {
      setQuests(JSON.parse(savedQuests));
    }
  }, []);



  const selectedCharacters = characters.filter(char => selectedCharacterIds.includes(char.id));
  const selectedLocation = locations.find(l => l.id === selectedLocationId);
  const npcsInLocation = selectedLocation?.npcs || [];
  const hostileNpcs = npcsInLocation.filter(npc => hostileNpcIds.includes(npc.id));

  return (
      <div className="space-y-6 p-4">
        {loading ? (
            <p className="text-yellow-300">Loading data...</p>
        ) : error ? (
            <p className="text-red-500">{error}</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Character and Location Select Section */}
              <div className="bg-gray-700 p-4 rounded">
                <h2 className="text-xl text-yellow-200 mb-2">Select Party (max 5)</h2>
                <select
                    onChange={handleCharacterSelect}
                    className="w-full p-2 bg-gray-600 text-white rounded mb-2"
                >
                  <option value="">Select character to add</option>
                  {characters.map(char => (
                      <option
                          key={char.id}
                          value={char.id}
                          disabled={selectedCharacterIds.includes(char.id)}
                      >
                        {char.name} - Level {char.level} {char.characterClass?.name}
                      </option>
                  ))}
                </select>
                <ul className="space-y-2 text-sm">
                  {selectedCharacters.map((char) => (
                      <li
                          key={char.id}
                          className="bg-gray-800 p-2 rounded relative cursor-pointer hover:bg-gray-700"
                          onClick={() => navigate(`/characters/${char.id}`)}
                      >
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCharacterRemove(char.id);
                            }}
                            className="absolute top-1 right-2 text-red-400 hover:text-red-600 text-xs"
                        >
                          ✕
                        </button>
                        <strong>{char.name}</strong> - {char.characterClass?.name} Lvl {char.level} | HP {char.currentHp}/{char.maxHp}
                        <p className="text-xs text-gray-300">{char.race?.name} | STR {char.strength}, DEX {char.dexterity}, CON {char.constitution}</p>
                        <p className="text-xs text-gray-300">INT {char.intelligence}, WIS {char.wisdom}, CHA {char.charisma}</p>
                        {char.items && char.items.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1 italic">
                              Items: {char.items.map(i => i.name + (i.equipState ? ' [E]' : '')).join(', ')}
                            </p>
                        )}
                      </li>
                  ))}
                </ul>
              </div>

              {/* Location Select Section */}
              <div className="bg-gray-700 p-4 rounded">
                <select
                    value={selectedLocationId || ''}
                    onChange={handleLocationSelect}
                    className="w-full p-2 bg-gray-600 text-white rounded"
                >
                  <option value="" disabled>Select a location</option>
                  {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                {selectedLocation && (
                    <div className="mt-2 text-sm text-gray-300">
                      <p><span className="text-yellow-300">Description:</span> {selectedLocation.description}</p>
                      {selectedLocation.monstersInLocation?.length > 0 && (
                          <>
                            <h3 className="text-yellow-200 mt-2 font-semibold">Monsters:</h3>
                            <ul className="list-disc pl-5 text-sm">
                              {selectedLocation.monstersInLocation
                                  .sort((a, b) => b.monster?.boss - a.monster?.boss) // Sort monsters with bosses first
                                  .map(mil => {
                                    const isBoss = mil.monster?.boss;

                                    return (
                                        <li
                                            key={mil.id}
                                            className={isBoss ? 'text-red-400 font-bold' : 'text-gray-300'}
                                        >
                                          {mil.monster?.name} (x{mil.quantity}){isBoss ? ' (BOSS)' : ''}
                                        </li>
                                    );
                                  })}
                              {hostileNpcs.map(npc => (
                                  <li key={npc.id} className="text-red-300">{npc.name} (Hostile NPC)</li>
                              ))}
                            </ul>

                          </>
                      )}
                    </div>
                )}
              </div>

              {/* NPCs in Location Section */}
              <div className="bg-gray-700 p-4 rounded col-span-1 md:col-span-2">
                <h2 className="text-xl text-yellow-200 mb-2">NPCs in Location</h2>
                {npcsInLocation.length > 0 ? (
                    <ul className="space-y-2 text-sm text-gray-200">
                      {npcsInLocation.map(npc => (
                          <li key={npc.id} className="bg-gray-800 p-2 rounded flex justify-between items-center">
                            <div>
                              <strong>{npc.name}</strong> – {npc.role}
                              {npc.description && <div className="text-xs text-gray-400 italic">"{npc.description}"</div>}
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                  type="checkbox"
                                  checked={hostileNpcIds.includes(npc.id)}
                                  onChange={() => toggleNpcHostility(npc.id)}
                              />
                              Hostile
                            </label>
                          </li>
                      ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No NPCs in this area.</p>
                )}
              </div>

              {/* Active Quests Section */}
              <div className="bg-gray-700 p-4 rounded col-span-1 md:col-span-2">
                <h2 className="text-xl text-yellow-200 mb-2">Active Quests</h2>
                {quests.length > 0 ? (
                    <ul className="space-y-2 text-sm text-gray-200">
                      {quests.map((quest) => (
                          <li key={quest.id} className="bg-gray-800 p-2 rounded flex justify-between items-center">
                            <div>
                              <strong>{quest.title}</strong> – {quest.type}
                              <div className="text-xs text-gray-400">{quest.description}</div>
                            </div>
                            <button
                                onClick={() => handleQuestCompletion(quest.id)}
                                disabled={quest.completion}
                                className={`px-2 py-1 ${quest.completion ? 'bg-gray-500' : 'bg-green-600'} rounded`}
                            >
                              {quest.completion ? 'Completed' : 'Mark as Completed'}
                            </button>
                          </li>
                      ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No active quests.</p>
                )}
              </div>
              {/* Quick Actions Section */}
              <div className="bg-gray-700 p-4 rounded">
                <h2 className="text-xl text-yellow-200 mb-2">Quick Actions</h2>
                <div className="mb-2">
                  <label className="text-gray-300 mr-2">Dice Type:</label>
                  <select
                      value={diceType}
                      onChange={(e) => setDiceType(e.target.value)}
                      className="bg-gray-600 text-white p-1 rounded"
                  >
                    {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-x-2">
                  <button onClick={rollDice} className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700">Roll Dice</button>
                  <button onClick={healParty} className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Heal Party</button>
                </div>
                {diceResult && <p className="mt-2 text-green-300">{diceResult}</p>}
              </div>
            </div>
        )}
      </div>
  );
}
