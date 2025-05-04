import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Draggable from 'react-draggable';
import { api } from '../api';

export default function Map() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const data = await api.getMapTokens();
        setTokens(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load map tokens');
        setLoading(false);
        console.error(err);
      }
    };

    fetchTokens();
  }, []);

  const handleDragStop = async (id, e, data) => {
    const newPosition = { x: data.x, y: data.y };
    try {
      await api.updateToken(id, newPosition);
      setTokens(tokens.map(token =>
          token.id === id ? { ...token, ...newPosition } : token
      ));
    } catch (err) {
      console.error('Failed to update token position:', err);
    }
  };

  if (loading) return <div className="text-yellow-300">Loading map...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
      <div className="bg-gray-800 rounded overflow-hidden h-[500px]">
        <TransformWrapper initialScale={1} minScale={0.5} maxScale={2}>
          <TransformComponent>
            <div className="relative">
              {/* Map background */}
              <img src="/map.jpg" alt="Fantasy Map" className="w-full" />
              {/* Tokens */}
              {tokens.map(token => (
                  <Draggable
                      key={token.id}
                      defaultPosition={{ x: token.x, y: token.y }}
                      onStop={(e, data) => handleDragStop(token.id, e, data)}
                  >
                    <div className="absolute bg-yellow-600 text-gray-900 px-2 py-1 rounded cursor-move">
                      {token.name}
                    </div>
                  </Draggable>
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
  );
}