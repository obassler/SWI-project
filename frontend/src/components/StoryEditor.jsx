import React, { useState } from 'react';

export default function StoryEditor() {
  const [story, setStory] = useState(
    'Once upon a time in the Ruined Watchtower...'
  );
  const [quests, setQuests] = useState([
    'Find the lost artifact',
    'Rescue the villager',
  ]);
  const [newQuest, setNewQuest] = useState('');

  const addQuest = () => {
    if (newQuest.trim()) {
      setQuests([...quests, newQuest.trim()]);
      setNewQuest('');
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded space-y-4">
      <h2 className="text-2xl text-yellow-300">Story Editor</h2>
      
      <div>
        <label className="block text-yellow-200 mb-1">Story Text:</label>
        <textarea
          className="w-full h-32 p-2 bg-gray-600 text-gray-100 rounded"
          value={story}
          onChange={e => setStory(e.target.value)}
        />
      </div>

      <div>
        <h3 className="text-xl text-yellow-200 mb-2">Quests</h3>
        <ul className="list-disc list-inside space-y-1 mb-2">
          {quests.map((q, i) => (
            <li key={i} className="bg-gray-600 p-1 rounded">{q}</li>
          ))}
        </ul>
        <div className="flex space-x-2">
          <input
            className="flex-1 p-1 bg-gray-600 text-gray-100 rounded"
            placeholder="New quest..."
            value={newQuest}
            onChange={e => setNewQuest(e.target.value)}
          />
          <button
            className="px-3 py-1 bg-yellow-600 rounded"
            onClick={addQuest}
          >
            Add Quest
          </button>
        </div>
      </div>
    </div>
  );
}
