import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Draggable from 'react-draggable';

const tokens = [
  { id: 1, name: 'Alan', x: 100, y: 50 },
  { id: 2, name: 'Lyria', x: 200, y: 150 },
];

export default function Map() {
  return (
    <div className="bg-gray-800 rounded overflow-hidden h-[500px]">
      <TransformWrapper initialScale={1} minScale={0.5} maxScale={2}>
        <TransformComponent>
          <div className="relative">
            {/* Pozadí mapy */}
            <img src="/map.jpg" alt="Fantasy Map" className="w-full" />
            {/* Tokeny */}
            {tokens.map(t => (
              <Draggable key={t.id} defaultPosition={{ x: t.x, y: t.y }}>
                <div className="absolute bg-yellow-600 text-gray-900 px-2 py-1 rounded cursor-move">
                  {t.name}
                </div>
              </Draggable>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
