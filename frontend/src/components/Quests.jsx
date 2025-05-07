import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function Quests() {
  const [story, setStory] = useState('');
  const [originalStory, setOriginalStory] = useState('');
  const [quests, setQuests] = useState([]);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    type: 'Main',
    completion: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [storyChanged, setStoryChanged] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const timeoutRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Add error handling for each promise individually
        let storyData, questData;

        try {
          storyData = await api.getStory();
        } catch (err) {
          console.error('Failed to load story:', err);
          storyData = { text: '' };
        }

        try {
          questData = await api.getQuests();
        } catch (err) {
          console.error('Failed to load quests:', err);
          questData = [];
        }

        setStory(storyData?.text || '');
        setOriginalStory(storyData?.text || '');
        setQuests(questData || []);
      } catch (err) {
        console.error('General error in fetching data:', err);
        setError('Failed to load story and quests');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if story has changed from original
  useEffect(() => {
    setStoryChanged(story !== originalStory);
  }, [story, originalStory]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [story]);

  // Clear success message after delay
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

  const saveStory = async () => {
    setSaving(true);
    try {
      await api.updateStory({ text: story });
      setOriginalStory(story);
      setStoryChanged(false);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to save story:', err);
    } finally {
      setSaving(false);
    }
  };

  const addQuest = async () => {
    if (!newQuest.title.trim() || !newQuest.description.trim()) return;

    try {
      const added = await api.addQuest(newQuest);
      if (added) {
        setQuests([...quests, added]);
        setNewQuest({ title: '', description: '', type: 'Main', completion: false });
      }
    } catch (err) {
      console.error('Failed to add quest:', err);
    }
  };

  const startEditQuest = (quest) => {
    setEditingQuest({...quest});
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
      setQuests(quests.map(q => q.id === editingQuest.id ? editingQuest : q));
      setEditingQuest(null);
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to update quest:', err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingQuest(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const deleteQuest = async (id) => {
    try {
      await api.deleteQuest(id);
      setQuests(quests.filter(q => q.id !== id));
      if (editingQuest?.id === id) {
        cancelEditQuest();
      }
    } catch (err) {
      console.error('Failed to delete quest:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewQuest(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleQuestCompletion = async (quest) => {
    try {
      const updatedQuest = { ...quest, completion: !quest.completion };
      await api.updateQuest(quest.id, updatedQuest);
      setQuests(quests.map(q => q.id === quest.id ? updatedQuest : q));
    } catch (err) {
      console.error('Failed to toggle quest completion:', err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading story..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
      <div className="p-6 space-y-6 text-white">
        <h1 className="text-3xl text-yellow-300">Story Editor</h1>

        <div className="bg-gray-700 p-4 rounded">
          <div className="flex justify-between items-center mb-2">
            <label className="text-yellow-200 text-lg">Story Text</label>
            <div className="flex items-center space-x-2">
              {storyChanged && (
                  <span className="text-yellow-400 text-sm italic">
                * Unsaved changes
              </span>
              )}
              {saveSuccess && (
                  <span className="text-green-400 text-sm animate-pulse">
                ✓ Saved successfully
              </span>
              )}
              <button
                  onClick={saveStory}
                  disabled={saving || !storyChanged}
                  className={`px-3 py-1 rounded transition-colors ${
                      saving || !storyChanged
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
              >
                {saving ? 'Saving...' : 'Save Story'}
              </button>
            </div>
          </div>
          <div className="relative bg-gray-600 rounded">
          <textarea
              ref={textareaRef}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full min-h-40 p-3 bg-gray-600 text-white rounded resize-none overflow-hidden"
              placeholder="Write your campaign story here..."
          />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {story.length} characters
            </div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-400">
            <div>
              Use markdown for formatting: **bold**, *italic*, # Heading
            </div>
            <button
                className="text-yellow-400 hover:underline"
                onClick={() => {
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
            >
              Focus editor
            </button>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-yellow-200">Quests</h2>
            <span className="text-sm text-gray-400">
            {quests.length} {quests.length === 1 ? 'quest' : 'quests'} total
          </span>
          </div>

          <ul className="space-y-1">
            {quests.length > 0 ? (
                quests.map(q => (
                    <li
                        key={q.id}
                        className={`bg-gray-600 p-2 rounded flex justify-between items-start ${
                            editingQuest?.id === q.id ? 'ring-2 ring-yellow-500' : ''
                        }`}
                    >
                      {editingQuest?.id === q.id ? (
                          <div className="w-full pr-2">
                            <div className="space-y-2">
                              <input
                                  name="title"
                                  value={editingQuest.title}
                                  onChange={handleEditChange}
                                  className="w-full bg-gray-700 p-1 rounded text-white border border-gray-500"
                                  placeholder="Quest Title"
                              />
                              <select
                                  name="type"
                                  value={editingQuest.type}
                                  onChange={handleEditChange}
                                  className="w-full bg-gray-700 p-1 rounded text-white border border-gray-500"
                              >
                                <option value="Main">Main Quest</option>
                                <option value="Side">Side Quest</option>
                                <option value="Daily">Daily Quest</option>
                              </select>
                              <textarea
                                  name="description"
                                  value={editingQuest.description}
                                  onChange={handleEditChange}
                                  className="w-full bg-gray-700 p-1 rounded text-white border border-gray-500"
                                  placeholder="Quest Description"
                                  rows={2}
                              />
                              <div className="flex items-center">
                                <label className="flex items-center gap-2 text-sm text-white">
                                  <input
                                      type="checkbox"
                                      name="completion"
                                      checked={editingQuest.completion}
                                      onChange={handleEditChange}
                                  />
                                  Quest Completed
                                </label>
                              </div>
                              <div className="flex space-x-2 justify-end">
                                <button
                                    onClick={cancelEditQuest}
                                    className="px-2 py-1 bg-gray-500 rounded text-sm hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                                <button
                                    onClick={saveEditedQuest}
                                    className="px-2 py-1 bg-yellow-600 rounded text-sm hover:bg-yellow-700"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </div>
                      ) : (
                          <>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <strong>{q.title}</strong>
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                    q.type === 'Main' ? 'bg-blue-800 text-blue-200' :
                                        q.type === 'Side' ? 'bg-purple-800 text-purple-200' :
                                            'bg-green-800 text-green-200'
                                }`}>
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
                                    title={q.completion ? "Mark as incomplete" : "Mark as complete"}
                                ></button>
                                <span className="text-xs text-gray-400">
                          {q.completion ? 'Completed' : 'Incomplete'}
                        </span>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                  onClick={() => startEditQuest(q)}
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                  title="Edit quest"
                              >
                                ✎
                              </button>
                              <button
                                  onClick={() => deleteQuest(q.id)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  title="Delete quest"
                              >
                                ✕
                              </button>
                            </div>
                          </>
                      )}
                    </li>
                ))
            ) : (
                <li className="bg-gray-600 p-3 rounded text-gray-400 text-center">
                  No quests available. Add your first quest below.
                </li>
            )}
          </ul>

          <div className="mt-4 bg-gray-600 p-3 rounded">
            <h3 className="text-md text-yellow-200 mb-2">Add New Quest</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                  name="title"
                  value={newQuest.title}
                  onChange={handleInputChange}
                  placeholder="Quest Title"
                  className="bg-gray-700 p-2 rounded text-white border border-gray-600"
              />
              <select
                  name="type"
                  value={newQuest.type}
                  onChange={handleInputChange}
                  className="bg-gray-700 p-2 rounded text-white border border-gray-600"
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
                  className="bg-gray-700 p-2 rounded text-white border border-gray-600 md:col-span-2"
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
            </div>

            <button
                onClick={addQuest}
                disabled={!newQuest.title.trim() || !newQuest.description.trim() || isEditing}
                className={`mt-3 px-4 py-2 rounded w-full ${
                    !newQuest.title.trim() || !newQuest.description.trim() || isEditing
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
            >
              Add Quest
            </button>
          </div>
        </div>
      </div>
  );
}