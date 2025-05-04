const API_BASE_URL = 'http://localhost:8080/api';

async function fetchApi(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

export const api = {
    // Characters
    getCharacters: () => fetchApi('/characters'),
    getCharacter: (id) => fetchApi(`/characters/${id}`),
    createCharacter: (data) => fetchApi('/characters', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateCharacter: (id, data) => fetchApi(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteCharacter: (id) => fetchApi(`/characters/${id}`, {
        method: 'DELETE'
    }),

    // Monsters
    getMonsters: () => fetchApi('/monsters'),
    getMonster: (id) => fetchApi(`/monsters/${id}`),
    createMonster: (data) => fetchApi('/monsters', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateMonster: (id, data) => fetchApi(`/monsters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteMonster: (id) => fetchApi(`/monsters/${id}`, {
        method: 'DELETE'
    }),

    // Items
    getItems: () => fetchApi('/items'),
    getItem: (id) => fetchApi(`/items/${id}`),
    createItem: (item) => fetchApi('/items', {
        method: 'POST',
        body: JSON.stringify(item),
    }),
    updateItem: (id, item) => fetchApi(`/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
    }),
    deleteItem: (id) => fetchApi(`/items/${id}`, {
        method: 'DELETE',
    }),

    // Map / Tokens
    getMapTokens: () => fetchApi('/map/tokens'),
    updateToken: (id, position) => fetchApi(`/map/tokens/${id}`, {
        method: 'PUT',
        body: JSON.stringify(position)
    }),

    // Story
    getStory: () => fetchApi('/story'),
    updateStory: (data) => fetchApi('/story', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // Quests
    getQuests: () => fetchApi('/quests'),
    addQuest: (quest) => fetchApi('/quests', {
        method: 'POST',
        body: JSON.stringify({ quest })
    }),
    deleteQuest: (id) => fetchApi(`/quests/${id}`, {
        method: 'DELETE'
    })
};
