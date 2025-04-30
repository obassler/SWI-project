import { useParams, Link } from 'react-router-dom';


const characters = [
  { id: '1', name: 'Alan the Brave', hp: 32, status: 'Healthy' },
  { id: '2', name: 'Lyria the Swift', hp: 27, status: 'Poisoned' },
];

export default function CharacterDetail() {
  const { id } = useParams();
  const char = characters.find(c => c.id === id);

  if (!char) return <p>Character not found.</p>;

  return (
    <div className="bg-gray-700 p-4 rounded space-y-4">
      <h2 className="text-2xl text-yellow-300">{char.name}</h2>
      <div>
        <strong>HP:</strong> {char.hp}
      </div>
      <div>
        <strong>Status:</strong> {char.status}
      </div>
      <div>
        <strong>Inventory:</strong>
        <ul className="list-disc list-inside">
          <li>Sword</li>
          <li>Shield</li>
          <li>Potion x2</li>
        </ul>
      </div>
      <Link to="/" className="text-blue-400 hover:underline">Back to Dashboard</Link>
    </div>
  );
}
