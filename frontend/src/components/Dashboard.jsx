import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-yellow-300">GM Control Panel</h1>
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-xl text-yellow-200 mb-2">Player Characters</h2>
          {/* zde bude seznam postav */}
          <Link to="/characters/1" className="text-blue-400 hover:underline">View Characters</Link>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-xl text-yellow-200 mb-2">Current Location</h2>
          {/* placeholder mapy */}
          <div className="h-32 bg-gray-600 rounded"></div>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-xl text-yellow-200 mb-2">Combat Encounter</h2>
          {/* placeholder boje */}
          <div className="h-32 bg-gray-600 rounded"></div>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-xl text-yellow-200 mb-2">Quick Actions</h2>
          {/* tlačítka akcí */}
          <button className="mr-2 px-3 py-1 bg-yellow-600 rounded">Roll Dice</button>
          <button className="px-3 py-1 bg-yellow-600 rounded">Adjust HP</button>
        </div>
      </section>
    </div>
  );
}
