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
        <div className="container mx-auto px-4">
            <div className="bg-gray-700 p-4 rounded space-y-4">
                <h2 className="text-2xl text-yellow-300">Items</h2>

                {/* Add New Item */}
                <div className="flex flex-wrap gap-4 items-end">
                    {[
                        { label: 'Name', name: 'name' },
                        { label: 'Type', name: 'type' },
                        { label: 'Description', name: 'description' },
                        { label: 'Weight', name: 'weight', type: 'number' },
                        { label: 'Gold Value', name: 'goldValue', type: 'number' },
                        { label: 'Magical Properties', name: 'magicalProperties' },
                        { label: 'Damage Type', name: 'damageType' },
                        { label: 'Damage Roll', name: 'damageRoll' },
                        { label: 'Armor Class', name: 'armorClass', type: 'number' }
                    ].map(({ label, name, type = 'text' }) => (
                        <div key={name} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                            <label className="block text-gray-300 text-sm">{label}</label>
                            <input
                                name={name}
                                value={newItem[name]}
                                onChange={handleInputChange}
                                type={type}
                                className="w-full p-1 rounded bg-gray-600 text-white"
                            />
                        </div>
                    ))}
                    <div className="w-full sm:w-auto">
                        <button
                            onClick={addItem}
                            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 mt-2"
                        >
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Item List */}
                {items.length === 0 ? (
                    <p className="text-gray-300">No items available.</p>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map(item => (
                            <li key={item.id} className="bg-gray-600 p-2 rounded">
                                {editingItemId === item.id ? (
                                    <div className="space-y-1">
                                        {[
                                            'name', 'type', 'description', 'weight',
                                            'goldValue', 'magicalProperties',
                                            'damageType', 'damageRoll', 'armorClass'
                                        ].map(field => (
                                            <input
                                                key={field}
                                                name={field}
                                                value={editForm[field]}
                                                onChange={handleEditChange}
                                                className="w-full p-1 bg-gray-700 text-white rounded"
                                            />
                                        ))}
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
        </div>
    );
}
