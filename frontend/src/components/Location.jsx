import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Location() {
  const [locations, setLocations] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', npcIds: [], monsterQuantities: {}
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [locs, mons, npcList] = await Promise.all([
        api.getLocation(), api.getMonsters(), api.getNpcs()
      ]);
      setLocations(locs);
      setMonsters(mons);
      setNpcs(npcList);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const handleEditClick = (location) => {
    const monsterQuantities = {};
    location.monstersInLocation?.forEach(mil => {
      monsterQuantities[mil.monster.id] = mil.quantity;
    });
    setEditingLocation(location.id);
    setFormData({
      name: location.name,
      description: location.description,
      npcIds: location.npcs?.map(n => n.id) || [],
      monsterQuantities
    });
  };

  const handleCancel = () => {
    setEditingLocation(null);
    setFormData({ name: '', description: '', npcIds: [], monsterQuantities: {} });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNpcCheckboxChange = (e) => {
    const id = parseInt(e.target.value);
    const checked = e.target.checked;
    setFormData(prev => {
      const ids = new Set(prev.npcIds);
      checked ? ids.add(id) : ids.delete(id);
      return { ...prev, npcIds: Array.from(ids) };
    });
  };

  const handleMonsterQuantityChange = (id, value) => {
    const quantity = parseInt(value);
    setFormData(prev => ({
      ...prev,
      monsterQuantities: {
        ...prev.monsterQuantities,
        [id]: quantity > 0 ? quantity : 0
      }
    }));
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        npcs: formData.npcIds.map(id => ({ id })),
        monstersInLocation: Object.entries(formData.monsterQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([monsterId, quantity]) => ({
              monster: { id: parseInt(monsterId) },
              quantity
            }))
      };
      await api.updateLocation(editingLocation, payload);
      await fetchData();
      handleCancel();
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  };

  return (
      <div className="p-4 space-y-6 text-white">
        <div className="bg-gray-700 p-4 rounded space-y-4">
          <h2 className="text-xl text-yellow-200">All Locations</h2>

          {locations.map(location => (
              <div key={location.id} className="bg-gray-800 p-4 rounded">
                {editingLocation === location.id ? (
                    <div className="space-y-2">
                      <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Location Name"
                          className="w-full p-2 rounded bg-gray-600 text-white"
                      />
                      <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Description"
                          className="w-full p-2 rounded bg-gray-600 text-white"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-yellow-300 font-semibold mb-1">Monsters</h3>
                          {monsters.map(mon => (
                              <label key={mon.id} className="block text-sm">
                                {mon.name}
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.monsterQuantities[mon.id] || ''}
                                    onChange={(e) => handleMonsterQuantityChange(mon.id, e.target.value)}
                                    className="w-20 ml-2 px-2 py-1 bg-gray-600 text-white rounded"
                                />
                              </label>
                          ))}
                        </div>
                        <div>
                          <h3 className="text-yellow-300 font-semibold mb-1">NPCs</h3>
                          {npcs
                              .filter(n => !n.location || n.location.id === editingLocation)
                              .map(npc => (
                                  <label key={npc.id} className="block text-sm">
                                    <input
                                        type="checkbox"
                                        value={npc.id}
                                        checked={formData.npcIds.includes(npc.id)}
                                        onChange={handleNpcCheckboxChange}
                                        className="mr-2"
                                    />
                                    {npc.name}
                                  </label>
                              ))}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button onClick={handleUpdate} className="bg-yellow-600 px-4 py-1 rounded hover:bg-yellow-700 text-black">Save</button>
                        <button onClick={handleCancel} className="bg-gray-600 px-4 py-1 rounded hover:bg-gray-500">Cancel</button>
                      </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                      <h3 className="text-yellow-300 font-semibold text-lg">{location.name}</h3>
                      <p className="text-sm text-gray-300">{location.description}</p>
                      <p className="text-sm text-gray-400">
                        <span className="text-yellow-400">Monsters:</span>{' '}
                        {location.monstersInLocation?.map(m => `${m.monster.name} (x${m.quantity})`).join(', ') || 'None'}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="text-yellow-400">NPCs:</span>{' '}
                        {location.npcs?.map(n => n.name).join(', ') || 'None'}
                      </p>
                      <button onClick={() => handleEditClick(location)} className="mt-2 bg-yellow-600 text-black px-3 py-1 rounded hover:bg-yellow-700">Edit</button>
                    </div>
                )}
              </div>
          ))}
        </div>
      </div>
  );
}
