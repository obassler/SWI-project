import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    fetchCharacters();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-yellow-300">GM Control Panel</h1>
      <section className="grid grid-cols-2 gap-4">
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
              {characters.map(char => (
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
                        <span className="ml-2 text-gray-300">
                          {char.race?.name}
                        </span>
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
          <Link 
            to="/characters/new" 
            className="text-blue-400 hover:underline"
          >
            Create New Character
          </Link>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-xl text-yellow-200 mb-2">Current Location</h2>
          {/* Map placeholder */}
          <div className="h-32 bg-gray-600 rounded"></div>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-xl text-yellow-200 mb-2">Combat Encounter</h2>
          {/* Combat placeholder */}
          <div className="h-32 bg-gray-600 rounded"></div>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-xl text-yellow-200 mb-2">Quick Actions</h2>
          {/* Action buttons */}
          <button className="mr-2 px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700">
            Roll Dice
          </button>
          <button className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700">
            Adjust HP
          </button>
        </div>
      </section>
    </div>
  );
}