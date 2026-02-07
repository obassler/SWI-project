const API_BASE_URL =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('token');

const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const setUser = (user) => {
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        localStorage.removeItem('user');
    }
};

async function fetchApi(endpoint, options = {}) {
    const { method = 'GET', body, headers = {}, withCredentials = true, ...rest } = options;
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
        credentials: withCredentials ? 'include' : 'same-origin',
        ...rest
    });

    const contentType = response.headers.get("content-type");

    if (response.status === 401) {
        setAuthToken(null);
        setUser(null);
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = contentType?.includes("application/json")
                ? await response.json()
                : { error: await response.text() };
        } catch {
            errorData = { error: 'Unknown error' };
        }
        const error = new Error(errorData.error || `API error: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    if (contentType?.includes("application/json")) {
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch {
            throw new Error("Invalid JSON response");
        }
    }

    return null;
}

export const auth = {
    login: async (username, password) => {
        const response = await fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        setAuthToken(response.token);
        setUser({ username: response.username, role: response.role });
        return response;
    },

    register: async (username, email, password) => {
        return fetchApi('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    },

    logout: () => {
        setAuthToken(null);
        setUser(null);
    },

    isAuthenticated: () => !!getAuthToken(),

    getUser,

    validateToken: async () => {
        try {
            const response = await fetchApi('/auth/validate');
            return response.valid;
        } catch {
            return false;
        }
    }
};

export const api = {
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

    getSpells: () => fetchApi('/spells'),
    getSpell: (id) => fetchApi(`/spells/${id}`),
    createSpell: (spell) => fetchApi('/spells', {
        method: 'POST',
        body: JSON.stringify(spell)
    }),
    updateSpell: (id, spell) => {
        return fetchApi(`/spells/${id}`, {
            method: 'PUT',
            body: JSON.stringify(spell)
        });
    },
    deleteSpell: (id) => {
        return fetchApi(`/spells/${id}`, {
            method: 'DELETE'
        });
    },
    assignSpellToCharacter: (characterId, spellId) =>
        fetchApi(`/characters/${characterId}/spells/${spellId}`, { method: 'POST' }),

    removeSpellFromCharacter: (characterId, spellId) =>
        fetchApi(`/characters/${characterId}/spells/${spellId}`, { method: 'DELETE' }),

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

    addEnemyToLocation: (locationId) => fetchApi(`/locations/${locationId}/add-random-monster`, {
        method: 'POST'
    })
};
