import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function StoryEditor() {
  const [story, setStory] = useState('');
  const [quests, setQuests] = useState([]);
  const [newQuest, setNewQuest] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState(null);

  useEffect(() => {
    const fetchStoryAndQuests = async () => {
      try {
        const [storyData, questsData] = await Promise.all([
          api.getStory(),
          api.getQuests()
        ]);
        setStory(storyData.text || '');
        setQuests(questsData || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load story and quests');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStoryAndQuests();
  }, []);

  const handleStoryChange = (e) => {
    setStory(e.target.value);
  };

  const saveStory = async () => {
    setSaving(true);
    setSavingError(null);
    try {
      await api.updateStory({ text: story });
      setSaving(false);
    } catch (err) {
      setSavingError('Failed to save story');
      setSaving(false);
      console.error(err);
    }
  };

  const addQuest = async () => {
    if (newQuest.trim()) {
      try {
        const addedQuest = await api.addQuest(newQuest.trim());
        setQuests([...quests, addedQuest]);
        setNewQuest('');
      } catch (err) {
        console.error('Failed to add quest:', err);
        setSavingError('Failed to add quest');
      }
    }
  };

  const deleteQuest = async (id) => {
    try {
      await api.deleteQuest(id);
      setQuests(quests.filter(quest => quest.id !== id));
    } catch (err) {
      console.error('Failed to delete quest:', err);
      setSavingError('Failed to delete quest');
    }
  };

  if (loading) return <div className="text-yellow-300">Loading story editor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
      <div className="bg-gray-700 p-4 rounded space-y-4">
        <h2 className="text-2xl text-yellow-300">Story Editor</h2>

        {/* Story text */}
        <div>
          <label className="block text-yellow-200 mb-1">Story Text:</label>
          <textarea
              className="w-full h-32 p-2 bg-gray-600 text-gray-100 rounded"
              value={story}
              onChange={handleStoryChange}
          />
          <div className="mt-2 flex justify-end">
            <button
                className={`px-3 py-1 rounded ${saving ? 'bg-gray-500' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                onClick={saveStory}
                disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Story'}
            </button>
            {savingError && <span className="text-red-500 ml-2">{savingError}</span>}
          </div>
        </div>

        {/* Quests Section */}
        <div>
          <h3 className="text-xl text-yellow-200 mb-2">Quests</h3>
          <ul className="list-disc list-inside space-y-1 mb-2">
            {quests.map((quest) => (
                <li key={quest.id} className="bg-gray-600 p-1 rounded flex justify-between items-center">
                  <span>{quest.text}</span>
                  <button
                      className="text-red-400 hover:text-red-600 px-2"
                      onClick={() => deleteQuest(quest.id)}
                  >
                    ✕
                  </button>
                </li>
            ))}
          </ul>
          <div className="flex space-x-2">
            <input
                className="flex-1 p-1 bg-gray-600 text-gray-100 rounded"
                placeholder="New quest..."
                value={newQuest}
                onChange={e => setNewQuest(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addQuest()}
            />
            <button
                className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700"
                onClick={addQuest}
            >
              Add Quest
            </button>
          </div>
        </div>
      </div>
  );
}
