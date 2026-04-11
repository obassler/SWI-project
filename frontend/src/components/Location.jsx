import React, { useEffect, useState } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Location() {
    const [locations, setLocations] = useState([]);
    const [monsters, setMonsters] = useState([]);
    const [npcs, setNpcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingLocation, setEditingLocation] = useState(null);
    const [creatingLocation, setCreatingLocation] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', npcIds: [], monsterQuantities: {}
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [locs, mons, npcList] = await Promise.all([
                api.getLocations(), api.getMonsters(), api.getNpcs()
            ]);
            setLocations(locs);
            setMonsters(mons);
            setNpcs(npcList);
        } catch (err) {
            setError('Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (location) => {
        const monsterQuantities = {};
        location.monstersInLocation?.forEach(mil => {
            monsterQuantities[mil.monster.id] = mil.quantity;
        });
        setEditingLocation(location.id);
        setCreatingLocation(false);
        setFormData({
            name: location.name,
            description: location.description,
            npcIds: location.npcs?.map(n => n.id) || [],
            monsterQuantities
        });
    };

    const handleCreateClick = () => {
        setCreatingLocation(true);
        setEditingLocation(null);
        setFormData({ name: '', description: '', npcIds: [], monsterQuantities: {} });
    };

    const handleCancel = () => {
        setEditingLocation(null);
        setCreatingLocation(false);
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

    const buildPayload = () => ({
        name: formData.name,
        description: formData.description,
        npcs: formData.npcIds.map(id => ({ id })),
        monstersInLocation: Object.entries(formData.monsterQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([monsterId, quantity]) => ({
                monster: { id: parseInt(monsterId) },
                quantity
            }))
    });

    const handleUpdate = async () => {
        try {
            await api.updateLocation(editingLocation, buildPayload());
            await fetchData();
            handleCancel();
        } catch (err) {
            setError('Failed to update location');
        }
    };

    const handleAddLocation = async () => {
        try {
            await api.createLocation(buildPayload());
            await fetchData();
            handleCancel();
        } catch (err) {
            setError('Failed to add location');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this location?')) return;
        try {
            await api.deleteLocation(id);
            await fetchData();
        } catch (err) {
            setError('Failed to delete location');
        }
    };

    const renderForm = (onSave, saveLabel) => (
        <div className="space-y-2 mt-4">
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
                        <div key={mon.id} className="flex items-center mb-1">
                            <label className="w-32 text-sm">{mon.name}</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.monsterQuantities[mon.id] || ''}
                                onChange={(e) => handleMonsterQuantityChange(mon.id, e.target.value)}
                                className="w-20 px-2 py-1 bg-gray-600 text-white rounded"
                            />
                        </div>
                    ))}
                </div>
                <div>
                    <h3 className="text-yellow-300 font-semibold mb-1">NPCs</h3>
                    {npcs.map(npc => (
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
            <div className="flex gap-4 mt-2">
                <button onClick={onSave} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">{saveLabel}</button>
                <button onClick={handleCancel} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancel</button>
            </div>
        </div>
    );

    if (loading) return <LoadingSpinner message="Loading locations..." />;
    if (error && !locations.length) return <ErrorMessage message={error} onRetry={fetchData} />;

    return (
        <div className="p-4 space-y-6 text-white">
            <button
                onClick={() => {
                    if (creatingLocation) {
                        handleCancel();
                    } else {
                        handleCreateClick();
                    }
                }}
                className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
                {creatingLocation ? 'Hide Form' : 'Create New Location'}
            </button>

            {creatingLocation && (
                <div className="bg-gray-700 p-4 rounded">
                    <h2 className="text-xl text-yellow-200">Add New Location</h2>
                    {renderForm(handleAddLocation, 'Create Location')}
                </div>
            )}

            {error && locations.length > 0 && <ErrorMessage message={error} />}

            <ul className="space-y-3">
                {locations.map(location => (
                    <li key={location.id} className="bg-gray-800 p-4 rounded">
                        {editingLocation === location.id ? (
                            <div>
                                <h2 className="text-xl text-yellow-200 mb-2">Edit Location</h2>
                                {renderForm(handleUpdate, 'Save Changes')}
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
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
                                </div>
                                <div className="flex gap-3 text-lg">
                                    <button onClick={() => handleEditClick(location)} className="text-green-400 hover:text-green-600">✎</button>
                                    <button onClick={() => handleDelete(location.id)} className="text-red-400 hover:text-red-600">✕</button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
