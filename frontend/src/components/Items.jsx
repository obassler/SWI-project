import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '', type: '', description: '', weight: '', goldValue: '', magicalProperties: '', equipState: false, damageType: '', damageRoll: '', armorClass: ''
    });
    const [editingItemId, setEditingItemId] = useState(null);

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await api.getItems();
            setItems(data);
        } catch (err) {
            setError('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value ?? '' }));
    };

    const saveItem = async () => {
        try {
            const payload = {
                ...newItem,
                weight: parseInt(newItem.weight) || 0,
                goldValue: parseInt(newItem.goldValue) || 0,
                armorClass: parseInt(newItem.armorClass) || 0
            };
            const res = editingItemId
                ? await api.updateItem(editingItemId, payload)
                : await api.createItem(payload);
            await fetchItems();
            setNewItem({ name: '', type: '', description: '', weight: '', goldValue: '', magicalProperties: '', equipState: false, damageType: '', damageRoll: '', armorClass: '' });
            setEditingItemId(null);
        } catch (err) {
            setError('Failed to save item');
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.deleteItem(id);
            fetchItems();
        } catch {
            setError('Failed to delete item');
        }
    };

    return (
        <div className="p-4 space-y-6 text-white">
            {loading ? (
                <LoadingSpinner message="Loading items..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={fetchItems} />
            ) : (
                <>
                    <div className="bg-gray-700 p-4 rounded space-y-2">
                        <h2 className="text-xl text-yellow-200">{editingItemId ? 'Edit Item' : 'Add New Item'}</h2>
                        {["name", "type", "description", "magicalProperties", "damageType", "damageRoll"].map(field => (
                            <input key={field} name={field} value={newItem[field] ?? ''} onChange={handleInputChange} placeholder={field}
                                   className="w-full p-2 rounded bg-gray-600 text-white" />
                        ))}
                        {["weight", "goldValue", "armorClass"].map(field => (
                            <input key={field} type="number" name={field} value={newItem[field] ?? ''} onChange={handleInputChange} placeholder={field.toUpperCase()}
                                   className="w-full p-2 rounded bg-gray-600 text-white" />
                        ))}
                        <button onClick={saveItem} className="bg-yellow-600 px-4 py-1 rounded hover:bg-yellow-700">Save</button>
                    </div>

                    <ul className="space-y-3">
                        {items.map(item => (
                            <li key={item.id} className="bg-gray-700 p-4 rounded">
                                <h3 className="text-yellow-300 font-semibold">{item.name}</h3>
                                <p className="text-gray-300 text-sm">{item.description}</p>
                                <p className="text-gray-400 text-sm">Type: {item.type} | Weight: {item.weight} | Gold: {item.goldValue}</p>
                                {item.magic && <p className="text-green-400 text-sm">Magical: {item.magicalProperties}</p>}
                                {item.damageType && <p className="text-sm text-blue-300">Damage: {item.damageRoll} ({item.damageType})</p>}
                                {item.armorClass > 0 && <p className="text-sm text-purple-300">Armor Class: {item.armorClass}</p>}
                                <div className="flex gap-3 mt-2">
                                    <button onClick={() => { setEditingItemId(item.id); setNewItem({
                                        name: item.name ?? '',
                                        type: item.type ?? '',
                                        description: item.description ?? '',
                                        weight: item.weight?.toString() ?? '',
                                        goldValue: item.goldValue?.toString() ?? '',
                                        magicalProperties: item.magicalProperties ?? '',
                                        equipState: item.equipState ?? false,
                                        damageType: item.damageType ?? '',
                                        damageRoll: item.damageRoll ?? '',
                                        armorClass: item.armorClass?.toString() ?? ''
                                    }); }}
                                            className="text-green-400 hover:text-green-600">✎</button>
                                    <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600">✕</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
