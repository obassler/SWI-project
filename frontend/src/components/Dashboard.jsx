import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [characters, setCharacters] = useState([]);
  const [location, setLocation] = useState(null);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationForm, setLocationForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diceResult, setDiceResult] = useState(null);
  const [diceType, setDiceType] = useState('d20');
  const [combatMonsters, setCombatMonsters] = useState([]); // Added for combat encounter

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await api.getCharacters();
        setCharacters(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load characters');
        setLoading(false);
        console.error(err);
      }
    };

    const fetchLocation = async () => {
      try {
        const locations = await api.getLocation();
        const loc = locations[0]; // Assuming the first location is the one we need
        setLocation(loc);
        setLocationForm({ name: loc.name, description: loc.description });
        setCombatMonsters(loc.monsters || []); // Set combat monsters from location
      } catch (err) {
        console.error('Failed to load location', err);
      }
    };

    fetchCharacters();
    fetchLocation();
  }, []);

  const rollDice = () => {
    const max = parseInt(diceType.slice(1));
    const result = Math.floor(Math.random() * max) + 1;
    setDiceResult(`Rolled a ${diceType}: ${result}`);
  };

  const handleLocationChange = (e) => {
    setLocationForm({ ...locationForm, [e.target.name]: e.target.value });
  };

  const saveLocation = async () => {
    try {
      const updated = await api.updateLocation(locationForm);
      setLocation(updated);
      setEditingLocation(false);
    } catch (err) {
      console.error('Failed to update location', err);
    }
  };

  return (
      <div className="space-y-6">
        <h1 className="text-3xl text-yellow-300">GM Control Panel</h1>
        <section className="grid grid-cols-2 gap-4">
          {/* Player Characters */}
          <div className="bg-gray-700 p-4 rounded">
            <h2 className="text-xl text-yellow-200 mb-2">Player Characters</h2>
            {loading ? (
                <p className="text-yellow-300">Loading characters...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : characters.length === 0 ? (
                <p className="text-gray-300">No characters available.</p>
            ) : (
                <ul className="space-y-1 mb-2">
                  {characters.slice(0, 5).map((char) => (  // Display first 5 characters
                      <li key={char.id} className="bg-gray-600 p-1 rounded">
                        <Link
                            to={`/characters/${char.id}`}
                            className="block hover:bg-gray-500 p-2 rounded"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{char.name}</span>
                              <span className="text-sm text-gray-300 ml-2">
                          {char.characterClass?.name} {char.level}
                        </span>
                            </div>
                            <div className="text-sm">
                        <span className="text-yellow-300">
                          HP: {char.currentHp}/{char.maxHp}
                        </span>
                              <span className="ml-2 text-gray-300">{char.race?.name}</span>
                            </div>
                          </div>
                          <div className="text-xs mt-1 flex space-x-2 text-gray-300">
                            <span>STR: {char.strength}</span>
                            <span>DEX: {char.dexterity}</span>
                            <span>CON: {char.constitution}</span>
                            <span>INT: {char.intelligence}</span>
                            <span>WIS: {char.wisdom}</span>
                            <span>CHA: {char.charisma}</span>
                          </div>
                        </Link>
                      </li>
                  ))}
                </ul>
            )}
            <Link to="/characters/new" className="text-blue-400 hover:underline">
              Create New Character
            </Link>
          </div>

          {/* Current Location */}
          <div className="bg-gray-700 p-4 rounded">
            <h2 className="text-xl text-yellow-200 mb-2">Current Location</h2>
            {location ? (
                editingLocation ? (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm text-gray-300">Name</label>
                        <input
                            name="name"
                            value={locationForm.name}
                            onChange={handleLocationChange}
                            className="w-full p-1 rounded bg-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300">Description</label>
                        <textarea
                            name="description"
                            value={locationForm.description}
                            onChange={handleLocationChange}
                            className="w-full p-1 rounded bg-gray-600 text-white"
                            rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                            onClick={saveLocation}
                            className="bg-green-600 px-2 py-1 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                            onClick={() => setEditingLocation(false)}
                            className="bg-gray-500 px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                ) : (
                    <div>
                      <div className="mb-2">
                        <h3 className="text-lg text-yellow-100">{location.name}</h3>
                        <p className="text-gray-300">{location.description}</p>
                      </div>
                      <button
                          onClick={() => setEditingLocation(true)}
                          className="text-blue-400 hover:underline mb-2"
                      >
                        Edit Location
                      </button>
                      <div className="mb-2">
                        <h4 className="text-yellow-200">Monsters</h4>
                        {combatMonsters.length ? (
                            <ul className="text-gray-300 list-disc pl-4">
                              {combatMonsters.map((monster) => (
                                  <li key={monster.id}>{monster.name}</li>
                              ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-sm">No monsters in this area.</p>
                        )}
                      </div>
                    </div>
                )
            ) : (
                <p className="text-yellow-300">Loading location...</p>
            )}
          </div>

          {/* Combat Encounter */}
          <div className="bg-gray-700 p-4 rounded">
            <h2 className="text-xl text-yellow-200 mb-2">Combat Encounter</h2>
            <div className="h-32 bg-gray-600 rounded">
              {combatMonsters.length > 0 ? (
                  <ul className="text-gray-300 list-disc pl-4">
                    {combatMonsters.map((monster) => (
                        <li key={monster.id}>{monster.name}</li>
                    ))}
                  </ul>
              ) : (
                  <p className="text-gray-400">No monsters to encounter right now.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-700 p-4 rounded">
            <h2 className="text-xl text-yellow-200 mb-2">Quick Actions</h2>
            <div className="mb-2">
              <label className="text-gray-300 mr-2">Dice Type:</label>
              <select
                  value={diceType}
                  onChange={(e) => setDiceType(e.target.value)}
                  className="bg-gray-600 text-white p-1 rounded"
              >
                <option value="d4">d4</option>
                <option value="d6">d6</option>
                <option value="d8">d8</option>
                <option value="d10">d10</option>
                <option value="d12">d12</option>
                <option value="d20">d20</option>
              </select>
            </div>
            <button
                onClick={rollDice}
                className="mr-2 px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700"
            >
              Roll Dice
            </button>
            <button className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700">
              Adjust HP
            </button>
            {diceResult && <p className="mt-2 text-green-300">{diceResult}</p>}
          </div>
        </section>
      </div>
  );
}
