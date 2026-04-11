import React, { useState, useEffect } from 'react';
import { api } from '../api';
import SearchSortBar, { useSearchSort } from './SearchSortBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const BONUS_FIELDS = ['strengthBonus', 'dexterityBonus', 'constitutionBonus', 'intelligenceBonus', 'wisdomBonus', 'charismaBonus'];
const BONUS_LABELS = { strengthBonus: 'STR', dexterityBonus: 'DEX', constitutionBonus: 'CON', intelligenceBonus: 'INT', wisdomBonus: 'WIS', charismaBonus: 'CHA' };

const emptyForm = {
    name: '', type: '', description: '', weight: '', goldValue: '', magicalProperties: '', equipState: false,
    damageType: '', damageRoll: '', armorClass: '',
    strengthBonus: 0, dexterityBonus: 0, constitutionBonus: 0, intelligenceBonus: 0, wisdomBonus: 0, charismaBonus: 0
};

export default function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newItem, setNewItem] = useState({ ...emptyForm });
    const [editingItemId, setEditingItemId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { searchTerm, setSearchTerm, sortField, sortDirection, handleSort, filterAndSort } = useSearchSort('name');

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

    const resetForm = () => {
        setNewItem({ ...emptyForm });
        setEditingItemId(null);
        setShowForm(false);
    };

    const saveItem = async () => {
        try {
            const payload = {
                ...newItem,
                weight: parseInt(newItem.weight) || 0,
                goldValue: parseInt(newItem.goldValue) || 0,
                armorClass: parseInt(newItem.armorClass) || 0,
                strengthBonus: parseInt(newItem.strengthBonus) || 0,
                dexterityBonus: parseInt(newItem.dexterityBonus) || 0,
                constitutionBonus: parseInt(newItem.constitutionBonus) || 0,
                intelligenceBonus: parseInt(newItem.intelligenceBonus) || 0,
                wisdomBonus: parseInt(newItem.wisdomBonus) || 0,
                charismaBonus: parseInt(newItem.charismaBonus) || 0,
            };
            editingItemId
                ? await api.updateItem(editingItemId, payload)
                : await api.createItem(payload);
            await fetchItems();
            resetForm();
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

    const startEdit = (item) => {
        setEditingItemId(item.id);
        setNewItem({
            name: item.name ?? '',
            type: item.type ?? '',
            description: item.description ?? '',
            weight: item.weight?.toString() ?? '',
            goldValue: item.goldValue?.toString() ?? '',
            magicalProperties: item.magicalProperties ?? '',
            equipState: item.equipState ?? false,
            damageType: item.damageType ?? '',
            damageRoll: item.damageRoll ?? '',
            armorClass: item.armorClass?.toString() ?? '',
            strengthBonus: item.strengthBonus ?? 0,
            dexterityBonus: item.dexterityBonus ?? 0,
            constitutionBonus: item.constitutionBonus ?? 0,
            intelligenceBonus: item.intelligenceBonus ?? 0,
            wisdomBonus: item.wisdomBonus ?? 0,
            charismaBonus: item.charismaBonus ?? 0,
        });
        setShowForm(true);
    };

    const getBonusDisplay = (item) => {
        const bonuses = BONUS_FIELDS
            .filter(f => item[f] && item[f] !== 0)
            .map(f => `+${item[f]} ${BONUS_LABELS[f]}`);
        return bonuses.length > 0 ? bonuses.join(', ') : null;
    };

    if (loading) return <LoadingSpinner message="Loading items..." />;
    if (error && !items.length) return <ErrorMessage message={error} onRetry={fetchItems} />;

    return (
        <div className="p-4 space-y-6 text-white">
            <button
                onClick={() => {
                    if (editingItemId) {
                        setEditingItemId(null);
                        setNewItem({ ...emptyForm });
                    }
                    setShowForm(!showForm);
                }}
                className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
                {showForm ? (editingItemId ? 'Cancel Edit' : 'Hide Form') : 'Create New Item'}
            </button>

            {showForm && (
                <div className="bg-gray-700 p-4 rounded space-y-2">
                    <h2 className="text-xl text-yellow-200">{editingItemId ? 'Edit Item' : 'Add New Item'}</h2>
                    {["name", "type", "description", "magicalProperties", "damageType", "damageRoll"].map(field => (
                        <input key={field} name={field} value={newItem[field] ?? ''} onChange={handleInputChange} placeholder={field}
                               className="w-full p-2 rounded bg-gray-600 text-white" />
                    ))}
                    {["weight", "goldValue", "armorClass"].map(field => (
                        <input key={field} type="number" name={field} value={newItem[field] ?? ''} onChange={handleInputChange} placeholder={field}
                               className="w-full p-2 rounded bg-gray-600 text-white" />
                    ))}
                    <h3 className="text-md text-yellow-200 mt-2">Stat Bonuses</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {BONUS_FIELDS.map(field => (
                            <div key={field} className="flex items-center gap-2">
                                <label className="text-sm text-gray-300 w-10">{BONUS_LABELS[field]}</label>
                                <input type="number" name={field} value={newItem[field] ?? 0} onChange={handleInputChange}
                                       className="w-full p-2 rounded bg-gray-600 text-white" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-2">
                        <button onClick={saveItem} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
                            {editingItemId ? 'Update Item' : 'Create Item'}
                        </button>
                        <button onClick={resetForm} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancel</button>
                    </div>
                </div>
            )}

            {error && <ErrorMessage message={error} onRetry={fetchItems} />}

            <SearchSortBar
                searchTerm={searchTerm} onSearchChange={setSearchTerm}
                sortField={sortField} sortDirection={sortDirection} onSort={handleSort}
                sortOptions={[['name', 'Name'], ['type', 'Type'], ['weight', 'Weight'], ['goldValue', 'Gold']]}
            />

            <ul className="space-y-3 mt-3">
                {filterAndSort(items, ['name', 'type', 'description', 'magicalProperties']).map(item => (
                    <li key={item.id} className="bg-gray-800 p-4 rounded">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-yellow-300 font-semibold">{item.name}</h3>
                                <p className="text-gray-300 text-sm">{item.description}</p>
                                <p className="text-gray-400 text-sm">Type: {item.type} | Weight: {item.weight} | Gold: {item.goldValue}</p>
                                {item.magicalProperties && <p className="text-green-400 text-sm">Magical: {item.magicalProperties}</p>}
                                {item.damageType && <p className="text-sm text-blue-300">Damage: {item.damageRoll} ({item.damageType})</p>}
                                {item.armorClass > 0 && <p className="text-sm text-purple-300">Armor Class: {item.armorClass}</p>}
                                {getBonusDisplay(item) && <p className="text-sm text-green-300">Bonuses: {getBonusDisplay(item)}</p>}
                            </div>
                            <div className="flex gap-3 text-lg">
                                <button onClick={() => startEdit(item)} className="text-green-400 hover:text-green-600">✎</button>
                                <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600">✕</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
