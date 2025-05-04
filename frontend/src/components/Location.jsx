import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Location() {
  const [locations, setLocations] = useState([]);
  const [monsters, setMonsters] = useState([]); // State to hold monsters
  const [newLocation, setNewLocation] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonster, setSelectedMonster] = useState(null); // State for the selected monster to add

  const fetchLocations = async () => {
    try {
      const data = await api.getLocations(); // Fetch existing locations
      setLocations(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load locations');
      setLoading(false);
    }
  };

  const fetchMonsters = async () => {
    try {
      const data = await api.getMonsters(); // Fetch available monsters
      setMonsters(data);
    } catch (err) {
      console.error('Failed to load monsters:', err);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchMonsters();
  }, []);

  const handleChange = (e) => {
    setNewLocation({ ...newLocation, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const addLocation = async () => {
    if (!newLocation.name) return;
    try {
      const created = await api.createLocation(newLocation); // POST /api/locations
      setLocations([...locations, created]);
      setNewLocation({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to add location:', err);
    }
  };

  const deleteLocation = async (id) => {
    try {
      await api.deleteLocation(id); // DELETE /api/locations/{id}
      setLocations(locations.filter(loc => loc.id !== id));
    } catch (err) {
      console.error('Failed to delete location:', err);
    }
  };

  const startEditing = (location) => {
    setEditingId(location.id);
    setEditForm({ name: location.name, description: location.description });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  const saveEdit = async () => {
    try {
      const updated = await api.updateLocation(editingId, editForm); // PUT /api/locations/{id}
      setLocations(locations.map(loc => loc.id === editingId ? updated : loc));
      cancelEditing();
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  };

  const addMonsterToLocation = async (locationId) => {
    if (!selectedMonster) return;
    try {
      const updatedLocation = await api.addMonsterToLocation(locationId, selectedMonster); // POST /api/locations/{id}/monsters
      setLocations(locations.map(loc => loc.id === locationId ? updatedLocation : loc));
      setSelectedMonster(null); // Reset selected monster
    } catch (err) {
      console.error('Failed to add monster:', err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading locations..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchLocations} />;

  return (
      <div className="bg-gray-800 text-white p-4 rounded space-y-4">
        <h2 className="text-2xl text-yellow-300">Locations</h2>

        {/* Add Location Form */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-sm">Name</label>
            <input
                name="name"
                value={newLocation.name}
                onChange={handleChange}
                className="w-full p-1 bg-gray-700 rounded text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm">Description</label>
            <input
                name="description"
                value={newLocation.description}
                onChange={handleChange}
                className="w-full p-1 bg-gray-700 rounded text-white"
            />
          </div>
          <button
              onClick={addLocation}
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>

        {/* Add Monster to Location */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-sm">Select Monster</label>
            <select
                value={selectedMonster ? selectedMonster.id : ''}
                onChange={e => setSelectedMonster(monsters.find(m => m.id === e.target.value))}
                className="w-full p-1 bg-gray-700 rounded text-white"
            >
              <option value="">Select a monster</option>
              {monsters.map(monster => (
                  <option key={monster.id} value={monster.id}>
                    {monster.name}
                  </option>
              ))}
            </select>
          </div>
          <button
              onClick={() => addMonsterToLocation(editingId)}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Monster
          </button>
        </div>

        {/* Location List */}
        <ul className="space-y-2">
          {locations.map(loc => (
              <li key={loc.id} className="bg-gray-700 p-3 rounded">
                {editingId === loc.id ? (
                    <div className="space-y-1">
                      <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full p-1 bg-gray-800 rounded text-white"
                      />
                      <input
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          className="w-full p-1 bg-gray-800 rounded text-white"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={saveEdit} className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">
                          Save
                        </button>
                        <button onClick={cancelEditing} className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600">
                          Cancel
                        </button>
                      </div>
                    </div>
                ) : (
                    <div>
                      <strong>{loc.name}</strong>
                      <p className="text-sm text-gray-300">{loc.description}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => startEditing(loc)} className="text-blue-400 hover:underline text-sm">
                          Edit
                        </button>
                        <button onClick={() => deleteLocation(loc.id)} className="text-red-400 hover:underline text-sm">
                          Delete
                        </button>
                      </div>
                      <div className="mt-2">
                        <strong>Monsters:</strong>
                        {loc.monsters?.length ? (
                            <ul className="space-y-1">
                              {loc.monsters.map(monster => (
                                  <li key={monster.id}>{monster.name}</li>
                              ))}
                            </ul>
                        ) : (
                            <p>No monsters in this location.</p>
                        )}
                      </div>
                    </div>
                )}
              </li>
          ))}
        </ul>
      </div>
  );
}
