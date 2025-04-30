import React from 'react';

const items = [
  { id: 1, name: 'Shortsword', type: 'Weapon' },
  { id: 2, name: 'Healing Potion', type: 'Consumable' },
  { id: 3, name: 'Lockpick Set', type: 'Tool' },
  { id: 4, name: 'Torch', type: 'Utility' },
];

export default function Items() {
  return (
    <div className="bg-gray-700 p-4 rounded space-y-4">
      <h2 className="text-2xl text-yellow-300">Items</h2>
      <ul className="grid grid-cols-2 gap-4">
        {items.map(item => (
          <li key={item.id} className="bg-gray-600 p-2 rounded">
            <strong>{item.name}</strong>
            <div className="text-sm text-gray-300">{item.type}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
