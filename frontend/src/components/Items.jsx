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
        weight: '',
        goldValue: '',
        magicalProperties: '',
        equipState: false,
        damageType: '',
        damageRoll: '',
        armorClass: ''
    });
    const [editingItemId, setEditingItemId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        type: '',
        description: '',
        weight: '',
        goldValue: '',
        magicalProperties: '',
        equipState: false,
        damageType: '',
        damageRoll: '',
        armorClass: ''
    });

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

    const handleInputChange = (e) => {
        setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const addItem = async () => {
        if (!newItem.name || !newItem.type) return;
        try {
            const created = await api.createItem(newItem);
            setItems([...items, created]);
            setNewItem({
                name: '',
                type: '',
                description: '',
                weight: '',
                goldValue: '',
                magicalProperties: '',
                equipState: false,
                damageType: '',
                damageRoll: '',
                armorClass: ''
            });
        } catch (err) {
            console.error('Failed to add item', err);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.deleteItem(id);
            setItems(items.filter(item => item.id !== id));
        } catch (err) {
            console.error('Failed to delete item', err);
        }
    };

    const startEditing = (item) => {
        setEditingItemId(item.id);
        setEditForm({ ...item });
    };

    const cancelEditing = () => {
        setEditingItemId(null);
        setEditForm({
            name: '',
            type: '',
            description: '',
            weight: '',
            goldValue: '',
            magicalProperties: '',
            equipState: false,
            damageType: '',
            damageRoll: '',
            armorClass: ''
        });
    };

    const saveEdit = async () => {
        try {
            const updated = await api.updateItem(editingItemId, editForm);
            setItems(items.map(item => item.id === updated.id ? updated : item));
            cancelEditing();
        } catch (err) {
            console.error('Failed to update item', err);
        }
    };

    if (loading) return <LoadingSpinner message="Loading items..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchItems} />;

    return (
        <div className="bg-gray-700 p-4 rounded space-y-4">
            <h2 className="text-2xl text-yellow-300">Items</h2>

            {/* Add New Item */}
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
                        value={newItem.weight}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                        type="number"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm">Gold Value</label>
                    <input
                        name="goldValue"
                        value={newItem.goldValue}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                        type="number"
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
                        value={newItem.armorClass}
                        onChange={handleInputChange}
                        className="p-1 rounded bg-gray-600 text-white"
                        type="number"
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
                                        className="w-full p-1 bg-gray-700 text-white rounded"
                                    />
                                    <input
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditChange}
                                        className="w-full p-1 bg-gray-700 text-white rounded"
                                    />
                                    <input
                                        name="weight"
                                        value={editForm.weight}
                                        onChange={handleEditChange}
                                        className="w-full p-1 bg-gray-700 text-white rounded"
                                    />
                                    <input
                                        name="goldValue"
                                        value={editForm.goldValue}
                                        onChange={handleEditChange}
                                        className="w-full p-1 bg-gray-700 text-white rounded"
                                    />
                                    <input
                                        name="magicalProperties"
                                        value={editForm.magicalProperties}
                                        onChange={handleEditChange}
                                        className="w-full p-1 bg-gray-700 text-white rounded"
                                    />
                                    <input
                                        name="damageType"
                                        value={editForm.damageType}
                                        onChange={handleEditChange}
                                        className="w-full p-1 bg-gray-700 text-white rounded"
                                    />
                                    <input
                                        name="damageRoll"
                                        value={editForm.damageRoll}
                                        onChange={handleEditChange}
                                        className="w-full p-1 bg-gray-700 text-white rounded"
                                    />

                                    ChatGPT řekl:

                                    <input
                                        name="armorClass"
                                        value={editForm.armorClass}
                                        onChange={handleEditChange}
                                        className="w-full p-1 bg-gray-700 text-white rounded"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={saveEdit}
                                            className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <h3 className="text-yellow-400">{item.name}</h3>
                                    <p className="text-gray-300">Type: {item.type}</p>
                                    <p className="text-gray-400">{item.description}</p>
                                    <p className="text-gray-500">Weight: {item.weight}</p>
                                    <p className="text-gray-500">Gold: {item.goldValue}</p>
                                    {item.magic && <p className="text-gray-400">Magical</p>}
                                    <button
                                        onClick={() => startEditing(item)}
                                        className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}