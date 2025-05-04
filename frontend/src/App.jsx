import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Map from './components/Location';
import CharacterDetail from './components/CharacterDetail';
import Items from './components/Items';
import Bestiary from './components/Bestiary';
import StoryEditor from './components/StoryEditor';
import Location from "./components/Location";

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-4 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/locations" element={<Location />} />
          <Route path="/characters/:id" element={<CharacterDetail />} />
          <Route path="/items" element={<Items />} />
          <Route path="/bestiary" element={<Bestiary />} />
          <Route path="/story" element={<StoryEditor />} />
        </Routes>
      </main>
    </div>
  );
}
