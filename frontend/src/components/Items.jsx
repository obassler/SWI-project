import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', type: '' });
    const [editingItemId, setEditingItemId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', type: '' });

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
            setNewItem({ name: '', type: '' });
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
        setEditForm({ name: item.name, type: item.type });
    };

    const cancelEditing = () => {
        setEditingItemId(null);
        setEditForm({ name: '', type: '' });
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
                                    <div className="flex gap-2 mt-1">
                                        <button onClick={saveEdit} className="bg-blue-600 px-2 py-1 rounded hover:bg-blue-700">Save</button>
                                        <button onClick={cancelEditing} className="bg-gray-500 px-2 py-1 rounded hover:bg-gray-600">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <strong>{item.name}</strong>
                                    <div className="text-sm text-gray-300">{item.type}</div>
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
