import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import SearchSortBar, { useSearchSort } from './SearchSortBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Quests() {
    const [quests, setQuests] = useState([]);
    const [newQuest, setNewQuest] = useState({
        title: '',
        description: '',
        type: 'Main',
        completion: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [editingQuest, setEditingQuest] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const timeoutRef = useRef(null);
    const { searchTerm, setSearchTerm, sortField, sortDirection, handleSort, filterAndSort } = useSearchSort('title');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const questData = await api.getQuests();
                setQuests(questData || []);
            } catch (err) {
                setError('Failed to load quests');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (saveSuccess) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [saveSuccess]);

    const addQuest = async () => {
        if (!newQuest.title.trim() || !newQuest.description.trim()) return;
        try {
            const added = await api.addQuest(newQuest);
            if (added) {
                setQuests([...quests, added]);
                setNewQuest({ title: '', description: '', type: 'Main', completion: false });
                setSaveSuccess(true);
                setShowForm(false);
            }
        } catch (err) {
            setError('Failed to add quest');
        }
    };

    const startEditQuest = (quest) => {
        setEditingQuest({ ...quest });
        setIsEditing(true);
    };

    const cancelEditQuest = () => {
        setEditingQuest(null);
        setIsEditing(false);
    };

    const saveEditedQuest = async () => {
        if (!editingQuest?.title.trim() || !editingQuest?.description.trim()) return;
        try {
            await api.updateQuest(editingQuest.id, editingQuest);
            setQuests(quests.map((q) => (q.id === editingQuest.id ? editingQuest : q)));
            setEditingQuest(null);
            setIsEditing(false);
            setSaveSuccess(true);
        } catch (err) {
            setError('Failed to update quest');
        }
    };

    const deleteQuest = async (id) => {
        try {
            await api.deleteQuest(id);
            setQuests(quests.filter((q) => q.id !== id));
            if (editingQuest?.id === id) {
                cancelEditQuest();
            }
        } catch (err) {
            setError('Failed to delete quest');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewQuest((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingQuest((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const toggleQuestCompletion = async (quest) => {
        try {
            const updatedQuest = { ...quest, completion: !quest.completion };
            await api.updateQuest(quest.id, updatedQuest);
            setQuests(quests.map((q) => (q.id === quest.id ? updatedQuest : q)));
        } catch (err) {
            setError('Failed to toggle quest completion');
        }
    };

    if (loading) return <LoadingSpinner message="Loading quests..." />;
    if (error && !quests.length) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

    return (
        <div className="p-4 space-y-6 text-white">
            <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
                {showForm ? 'Hide Form' : 'Create New Quest'}
            </button>

            {showForm && (
                <div className="bg-gray-700 p-4 rounded space-y-4">
                    <h2 className="text-xl text-yellow-200">Add New Quest</h2>
                    <input
                        name="title"
                        value={newQuest.title}
                        onChange={handleInputChange}
                        placeholder="Quest Title"
                        className="w-full p-2 rounded bg-gray-600 text-white"
                    />
                    <select
                        name="type"
                        value={newQuest.type}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded bg-gray-600 text-white"
                    >
                        <option value="Main">Main Quest</option>
                        <option value="Side">Side Quest</option>
                        <option value="Daily">Daily Quest</option>
                    </select>
                    <textarea
                        name="description"
                        value={newQuest.description}
                        onChange={handleInputChange}
                        placeholder="Quest Description"
                        className="w-full p-2 rounded bg-gray-600 text-white"
                        rows={2}
                    />
                    <label className="flex items-center gap-2 text-sm text-white">
                        <input
                            type="checkbox"
                            name="completion"
                            checked={newQuest.completion}
                            onChange={handleInputChange}
                        />
                        Quest Completed
                    </label>
                    <div className="flex gap-4">
                        <button
                            onClick={addQuest}
                            disabled={!newQuest.title.trim() || !newQuest.description.trim() || isEditing}
                            className={`px-4 py-2 rounded ${
                                !newQuest.title.trim() || !newQuest.description.trim() || isEditing
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            Create Quest
                        </button>
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {saveSuccess && <p className="text-green-400 text-sm">Saved successfully!</p>}
            {error && quests.length > 0 && <ErrorMessage message={error} />}

            <div>
                <p className="mb-2 text-sm text-gray-400">
                    {quests.length} {quests.length === 1 ? 'quest' : 'quests'} total
                </p>
                <SearchSortBar
                    searchTerm={searchTerm} onSearchChange={setSearchTerm}
                    sortField={sortField} sortDirection={sortDirection} onSort={handleSort}
                    sortOptions={[['title', 'Title'], ['type', 'Type'], ['completion', 'Status']]}
                />
                <ul className="space-y-3 mt-3">
                    {quests.length > 0 ? (
                        filterAndSort(quests, ['title', 'description', 'type']).map((q) => (
                            <li
                                key={q.id}
                                className={`bg-gray-800 p-4 rounded ${
                                    editingQuest?.id === q.id ? 'ring-2 ring-yellow-500' : ''
                                }`}
                            >
                                {editingQuest?.id === q.id ? (
                                    <div className="space-y-2">
                                        <input
                                            name="title"
                                            value={editingQuest.title}
                                            onChange={handleEditChange}
                                            className="w-full bg-gray-700 p-2 rounded text-white"
                                            placeholder="Quest Title"
                                        />
                                        <select
                                            name="type"
                                            value={editingQuest.type}
                                            onChange={handleEditChange}
                                            className="w-full bg-gray-700 p-2 rounded text-white"
                                        >
                                            <option value="Main">Main Quest</option>
                                            <option value="Side">Side Quest</option>
                                            <option value="Daily">Daily Quest</option>
                                        </select>
                                        <textarea
                                            name="description"
                                            value={editingQuest.description}
                                            onChange={handleEditChange}
                                            className="w-full bg-gray-700 p-2 rounded text-white"
                                            placeholder="Quest Description"
                                            rows={2}
                                        />
                                        <label className="flex items-center gap-2 text-sm text-white">
                                            <input
                                                type="checkbox"
                                                name="completion"
                                                checked={editingQuest.completion}
                                                onChange={handleEditChange}
                                            />
                                            Quest Completed
                                        </label>
                                        <div className="flex gap-4 justify-end">
                                            <button onClick={cancelEditQuest} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
                                                Cancel
                                            </button>
                                            <button onClick={saveEditedQuest} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <div className="flex items-center">
                                                <h3 className="text-yellow-300 font-semibold">{q.title}</h3>
                                                <span
                                                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                                        q.type === 'Main'
                                                            ? 'bg-blue-800 text-blue-200'
                                                            : q.type === 'Side'
                                                                ? 'bg-purple-800 text-purple-200'
                                                                : 'bg-green-800 text-green-200'
                                                    }`}
                                                >
                                                    {q.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-300">{q.description}</p>
                                            <div className="flex items-center mt-1">
                                                <button
                                                    onClick={() => toggleQuestCompletion(q)}
                                                    className={`w-4 h-4 rounded-full mr-1 cursor-pointer ${
                                                        q.completion ? 'bg-green-500' : 'bg-gray-500'
                                                    }`}
                                                    title={q.completion ? 'Mark as incomplete' : 'Mark as complete'}
                                                ></button>
                                                <span className="text-xs text-gray-400">
                                                    {q.completion ? 'Completed' : 'Incomplete'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-lg">
                                            <button onClick={() => startEditQuest(q)} className="text-green-400 hover:text-green-600">✎</button>
                                            <button onClick={() => deleteQuest(q.id)} className="text-red-400 hover:text-red-600">✕</button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))
                    ) : (
                        <li className="bg-gray-800 p-4 rounded text-gray-400 text-center">
                            No quests available. Create your first quest above.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
