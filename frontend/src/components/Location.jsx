import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Location() {
  const [locations, setLocations] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [selectedMonsterId, setSelectedMonsterId] = useState('');
  const [selectedNpcId, setSelectedNpcId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocations = async () => {
    try {
      const data = await api.getLocation();
      setLocations(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load locations');
      setLoading(false);
    }
  };

  const fetchMonsters = async () => {
    try {
      const data = await api.getMonsters();
      setMonsters(data);
    } catch (err) {
      console.error('Failed to load monsters:', err);
    }
  };

  const fetchNpcs = async () => {
    try {
      const data = await api.getNpcs();
      setNpcs(data);
    } catch (err) {
      console.error('Failed to load NPCs:', err);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchMonsters();
    fetchNpcs();
  }, []);

  const addMonsterToLocation = async (locationId, monsterId) => {
    try {
      await api.post(`/locations/${locationId}/monsters/${monsterId}`);
      fetchLocations();
    } catch (err) {
      console.error('Failed to add monster to location:', err);
    }
  };

  const addNpcToLocation = async (locationId, npcId) => {
    try {
      await api.post(`/locations/${locationId}/npcs/${npcId}`);
      fetchLocations();
    } catch (err) {
      console.error('Failed to add NPC to location:', err);
    }
  };

  const removeMonsterFromLocation = async (locationId, monsterId) => {
    try {
      await api.delete(`/locations/${locationId}/monsters/${monsterId}`);
      fetchLocations();
    } catch (err) {
      console.error('Failed to remove monster from location:', err);
    }
  };

  const removeNpcFromLocation = async (locationId, npcId) => {
    try {
      await api.delete(`/locations/${locationId}/npcs/${npcId}`);
      fetchLocations();
    } catch (err) {
      console.error('Failed to remove NPC from location:', err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading locations..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchLocations} />;

  return (
      <div className="bg-gray-800 text-white p-4 rounded space-y-4">
        <h2 className="text-2xl text-yellow-300">Locations</h2>

        {locations.map(loc => (
            <div key={loc.id}>
              <h3>{loc.name}</h3>
              <div>
                <strong>Monsters:</strong>
                <ul>
                  {loc.monsters.map(monster => (
                      <li key={monster.id}>
                        {monster.name}
                        <button onClick={() => removeMonsterFromLocation(loc.id, monster.id)}>Remove</button>
                      </li>
                  ))}
                </ul>
                <select
                    value={selectedMonsterId}
                    onChange={e => setSelectedMonsterId(e.target.value)}>
                  <option value="">Select Monster</option>
                  {monsters.map(monster => (
                      <option key={monster.id} value={monster.id}>
                        {monster.name}
                      </option>
                  ))}
                </select>
                <button onClick={() => addMonsterToLocation(loc.id, selectedMonsterId)}>Add Monster</button>
              </div>

              <div>
                <strong>Npcs:</strong>
                <ul>
                  {loc.npcs.map(npc => (
                      <li key={npc.id}>
                        {npc.name}
                        <button onClick={() => removeNpcFromLocation(loc.id, npc.id)}>Remove</button>
                      </li>
                  ))}
                </ul>
                <select
                    value={selectedNpcId}
                    onChange={e => setSelectedNpcId(e.target.value)}>
                  <option value="">Select NPC</option>
                  {npcs.map(npc => (
                      <option key={npc.id} value={npc.id}>
                        {npc.name}
                      </option>
                  ))}
                </select>
                <button onClick={() => addNpcToLocation(loc.id, selectedNpcId)}>Add NPC</button>
              </div>
            </div>
        ))}
      </div>
  );
}
