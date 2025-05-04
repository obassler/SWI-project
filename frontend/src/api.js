const API_BASE_URL = 'http://localhost:8080/api';

async function fetchApi(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

export const api = {
    getCharacters: () => fetchApi('/characters'),
    getCharacter: (id) => fetchApi(`/characters/${id}`),
    updateCharacter: (id, data) => fetchApi(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    getMonsters: () => fetchApi('/monsters'),
    getMonster: (id) => fetchApi(`/monsters/${id}`),

    getItems: () => fetchApi('/items'),
    getItem: (id) => fetchApi(`/items/${id}`),

    getMapTokens: () => fetchApi('/map/tokens'),
    updateToken: (id, position) => fetchApi(`/map/tokens/${id}`, {
        method: 'PUT',
        body: JSON.stringify(position)
    }),
    getStory: () => fetchApi('/story'),
    updateStory: (data) => fetchApi('/story', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    getQuests: () => fetchApi('/quests'),
    addQuest: (quest) => fetchApi('/quests', {
        method: 'POST',
        body: JSON.stringify({ quest })
    }),
    deleteQuest: (id) => fetchApi(`/quests/${id}`, {
        method: 'DELETE'
    })
};