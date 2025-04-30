import React from 'react';

const monsters = [
  { id: 1, name: 'Goblin', hp: 18, ac: 12 },
  { id: 2, name: 'Orc', hp: 30, ac: 13 },
  { id: 3, name: 'Bandit', hp: 27, ac: 15 },
  { id: 4, name: 'Zombie', hp: 22, ac: 8 },
];

export default function Bestiary() {
  return (
    <div className="bg-gray-700 p-4 rounded space-y-4">
      <h2 className="text-2xl text-yellow-300">Bestiary</h2>
      <ul className="space-y-2">
        {monsters.map(m => (
          <li key={m.id} className="bg-gray-600 p-3 rounded">
            <div><strong>{m.name}</strong></div>
            <div>HP: {m.hp} | AC: {m.ac}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
