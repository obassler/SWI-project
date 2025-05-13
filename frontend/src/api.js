const API_BASE_URL =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('token');

async function fetchApi(endpoint, options = {}) {
    const { method = 'GET', body, headers = {}, ...rest } = options;
    const token = getAuthToken();

    const fullHeaders = {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: fullHeaders,
        body,
        credentials: 'include',
        ...rest
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
        let errorText;
        try {
            errorText = contentType?.includes("application/json")
                ? JSON.stringify(await response.json())
                : await response.text();
        } catch {
            errorText = 'Unknown error';
        }
        console.error(`API error: ${response.status} - ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    if (contentType?.includes("application/json")) {
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch {
            console.error("Failed to parse JSON:", text);
            throw new Error("Invalid JSON response");
        }
    }

    return null;
}

export const api = {
    // Characters
    getCharacters: () => fetchApi('/characters'),
    getCharacter: (id) => fetchApi(`/characters/${id}`),
    createCharacter: (character) => fetchApi('/characters', {
        method: 'POST',
        body: JSON.stringify(character)
    }),
    updateCharacter: (id, character) => fetchApi(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(character)
    }),
    deleteCharacter: (id) => fetchApi(`/characters/${id}`, {
        method: 'DELETE'
    }),
    healCharacter: (id) => fetchApi(`/characters/${id}/heal`, {
        method: 'PUT'
    }),

    healParty: (characterIds) => fetchApi('/characters/heal-batch', {
        method: 'PUT',
        body: JSON.stringify(characterIds)
    }),

    assignItemToCharacter: (characterId, itemId) =>
        fetchApi(`/characters/${characterId}/items/${itemId}`, { method: 'POST' }),

    removeItemFromCharacter: (characterId, itemId) =>
        fetchApi(`/characters/${characterId}/items/${itemId}`, { method: 'DELETE' }),

    equipItem: (characterId, itemId, equip) =>
        fetchApi(`/characters/${characterId}/equip`, {
            method: 'POST',
            body: JSON.stringify({ itemId, equip })
        }),

    assignSpellToCharacter: (characterId, spellId) =>
        fetchApi(`/characters/${characterId}/spells/${spellId}`, { method: 'POST' }),

    // Items
    getItems: () => fetchApi('/items'),
    getItem: (id) => fetchApi(`/items/${id}`),
    createItem: (item) => fetchApi('/items', {
        method: 'POST',
        body: JSON.stringify(item)
    }),
    updateItem: (id, item) => fetchApi(`/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item)
    }),
    deleteItem: (id) => fetchApi(`/items/${id}`, { method: 'DELETE' }),

    // Spells
    getSpells: () => fetchApi('/spells'),

    // Monsters
    getMonsters: () => fetchApi('/monsters'),
    getMonster: (id) => fetchApi(`/monsters/${id}`),
    createMonster: (monster) => fetchApi('/monsters', {
        method: 'POST',
        body: JSON.stringify(monster)
    }),
    updateMonster: (id, monster) => fetchApi(`/monsters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(monster)
    }),
    deleteMonster: (id) => fetchApi(`/monsters/${id}`, { method: 'DELETE' }),

    // NPCs
    getNpcs: () => fetchApi('/npcs'),
    getNpc: (id) => fetchApi(`/npcs/${id}`),
    createNpc: (npc) => fetchApi('/npcs', {
        method: 'POST',
        body: JSON.stringify(npc)
    }),
    updateNpc: (id, npc) => fetchApi(`/npcs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(npc)
    }),
    deleteNpc: (id) => fetchApi(`/npcs/${id}`, { method: 'DELETE' }),

    // Locations
    getLocation: () => fetchApi('/locations'),
    createLocation: (location) => fetchApi('/locations', {
        method: 'POST',
        body: JSON.stringify(location)
    }),
    updateLocation: (id, location) => fetchApi(`/locations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(location)
    }),
    deleteLocation: (id) => fetchApi(`/locations/${id}`, { method: 'DELETE' }),

    // Quests
    getQuests: () => fetchApi('/quests'),
    getQuest: (id) => fetchApi(`/quests/${id}`),
    addQuest: (quest) => fetchApi('/quests', {
        method: 'POST',
        body: JSON.stringify(quest)
    }),
    updateQuest: (id, quest) => fetchApi(`/quests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(quest)
    }),
    deleteQuest: (id) => fetchApi(`/quests/${id}`, {
        method: 'DELETE'
    }),

    // Story
    getStory: () => fetchApi('/story'),
    updateStory: (story) => fetchApi('/story', {
        method: 'PUT',
        body: JSON.stringify(story)
    }),

    // Extra functionality
    addEnemyToLocation: (locationId) => fetchApi(`/locations/${locationId}/add-random-monster`, {
        method: 'POST'
    })
};