import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        type: '',
        description: '',
        weight: 0,
        goldValue: 0,
        magic: false,
        magicalProperties: '',
        equipState: false,
        damageType: '',
        damageRoll: '',
        armorClass: 0
    });
    const [editingItemId, setEditingItemId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        type: '',
        description: '',
        weight: 0,
        goldValue: 0,
        magic: false,
        magicalProperties: '',
        equipState: false,
        damageType: '',
        damageRoll: '',
        armorClass: 0
    });

    // Fetch all items from the API
    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getItems();
            setItems(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load items');
            setLoading(false);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Handle change in the new item form
    const handleInputChange = (e) => {
        setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    // Handle change in the edit item form
    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    // Add a new item
    const addItem = async () => {
        if (!newItem.name || !newItem.type || !newItem.description || newItem.weight <= 0) {
            console.error('Some required fields are missing.');
            return;
        }
        try {
            const created = await api.createItem(newItem);
            setItems([...items, created]);
            setNewItem({
                name: '',
                type: '',
                description: '',
                weight: 0,
                goldValue: 0,
                magic: false,
                magicalProperties: '',
                equipState: false,
                damageType: '',
                damageRoll: '',
                armorClass: 0
            });
        } catch (err) {
            console.error('Failed to add item', err);
        }
    };

    // Delete an item
    const deleteItem = async (id) => {
        try {
            await api.deleteItem(id);
            setItems(items.filter(item => item.id !== id));
        } catch (err) {
            console.error('Failed to delete item', err);
        }
    };

    // Start editing an item
    const startEditing = (item) => {
        setEditingItemId(item.id);
        setEditForm({
            name: item.name,
            type: item.type,
            description: item.description,
            weight: item.weight,
            goldValue: item.goldValue,
            magic: item.magic,
            magicalProperties: item.magicalProperties,
            equipState: item.equipState,
            damageType: item.damageType,
            damageRoll: item.damageRoll,
            armorClass: item.armorClass
        });
    };

    // Cancel editing an item
    const cancelEditing = () => {
        setEditingItemId(null);
        setEditForm({
            name: '',
            type: '',
            description: '',
            weight: 0,
            goldValue: 0,
            magic: false,
            magicalProperties: '',
            equipState: false,
            damageType: '',
            damageRoll: '',
            armorClass: 0
        });
    };

    // Save edited item
    const saveEdit = async () => {
        try {
            const updatedItem = {
                ...editForm
            };
            const updated = await api.updateItem(editingItemId, updatedItem);
            setItems(items.map(item => item.id === updated.id ? updated : item));
            cancelEditing();
        } catch (err) {
            console.error('Failed to update item', err);
        }
    };

    // Show loading spinner while fetching data
    if (loading) return <LoadingSpinner message="Loading items..." />;
    // Show error message if there was an issue fetching items
    if (error) return <ErrorMessage message={error} onRetry={fetchItems} />;

    return (
        <div className="bg-gray-700 p-4 rounded space-y-4">
            <h2 className="text-2xl text-yellow-300">Items</h2>

            {/* Add New Item Form */}
            <div className="flex gap-2 items-end">
                <div>
                    <label className="block text-gray-300 text-sm">Name</label>
                    <input
                        name="name"
                        value={newItem.name}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Type</label>
                    <input
                        name="type"
                        value={newItem.type}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Description</label>
                    <input
                        name="description"
                        value={newItem.description}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Weight</label>
                    <input
                        name="weight"
                        type="number"
                        value={newItem.weight}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Gold Value</label>
                    <input
                        name="goldValue"
                        type="number"
                        value={newItem.goldValue}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Is Magic?</label>
                    <input
                        name="magic"
                        type="checkbox"
                        checked={newItem.magic}
                        onChange={(e) => setNewItem({ ...newItem, magic: e.target.checked })}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Magical Properties</label>
                    <input
                        name="magicalProperties"
                        value={newItem.magicalProperties}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Damage Type</label>
                    <input
                        name="damageType"
                        value={newItem.damageType}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Damage Roll</label>
                    <input
                        name="damageRoll"
                        value={newItem.damageRoll}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Armor Class</label>
                    <input
                        name="armorClass"
                        type="number"
                        value={newItem.armorClass}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                    />
                </div>
                <button
                    onClick={addItem}
                    className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                >
                    Add Item
                </button>
            </div>

            {/* Item List */}
            {items.length === 0 ? (
                <p className="text-gray-300">No items available.</p>
            ) : (
                <ul className="grid grid-cols-2 gap-4">
                    {items.map(item => (
                        <li key={item.id} className="bg-gray-600 p-2 rounded">
                            {editingItemId === item.id ? (
                                <div className="space-y-1">
                                    <input
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditChange}
                                        className="w-full p-1 bg-gray-700 text-white rounded"
                                    />
                                    <input
                                        name="type"
                                        value={editForm.type}
                                        onChange={handleEditChange}
                                        className="w-full p-1 bg-gray-700 text-white rounded"/>
                                    <input name="description" value={editForm.description} onChange={handleEditChange} className="w-full p-1 bg-gray-700 text-white rounded" />
                                    <input name="weight" type="number" value={editForm.weight} onChange={handleEditChange} className="w-full p-1 bg-gray-700 text-white rounded" />
                                    <input name="goldValue" type="number" value={editForm.goldValue} onChange={handleEditChange} className="w-full p-1 bg-gray-700 text-white rounded" />
                                    <input name="magicalProperties" value={editForm.magicalProperties} onChange={handleEditChange} className="w-full p-1 bg-gray-700 text-white rounded" />
                                    <input name="damageType" value={editForm.damageType} onChange={handleEditChange} className="w-full p-1 bg-gray-700 text-white rounded" />
                                    <input name="damageRoll" value={editForm.damageRoll} onChange={handleEditChange} className="w-full p-1 bg-gray-700 text-white rounded" />
                                    <input name="armorClass" type="number" value={editForm.armorClass} onChange={handleEditChange} className="w-full p-1 bg-gray-700 text-white rounded" />
                                    <div className="flex gap-2 mt-1">
                                        <button onClick={saveEdit} className="bg-blue-600 px-2 py-1 rounded hover:bg-blue-700">Save</button>
                                        <button onClick={cancelEditing} className="bg-gray-500 px-2 py-1 rounded hover:bg-gray-600">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <strong>{item.name}</strong>
                                    <div className="text-sm text-gray-300">{item.type}</div>
                                    <div className="text-sm text-gray-300">Gold Value: {item.goldValue}</div>
                                    {item.magic && <div className="text-sm text-gray-300">Magical Properties: {item.magicalProperties}</div>}
                                    {item.damageType && <div className="text-sm text-gray-300">Damage: {item.damageType} {item.damageRoll}</div>}
                                    {item.armorClass > 0 && <div className="text-sm text-gray-300">Armor Class: {item.armorClass}</div>}
                                    <div className="flex gap-2 mt-1">
                                        <button onClick={() => startEditing(item)} className="text-blue-400 hover:underline text-sm">Edit</button>
                                        <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:underline text-sm">Delete</button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}