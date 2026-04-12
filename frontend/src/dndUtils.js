export const getModifier = (score) => Math.floor((score - 10) / 2);

export const formatModifier = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);

export const getProficiencyBonus = (level) => Math.ceil(level / 4) + 1;

export const XP_THRESHOLDS = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

export const D5E_CONDITIONS = [
    'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
    'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified',
    'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'
];

export const D5E_SKILLS = [
    { name: 'Acrobatics', ability: 'dexterity' },
    { name: 'Animal Handling', ability: 'wisdom' },
    { name: 'Arcana', ability: 'intelligence' },
    { name: 'Athletics', ability: 'strength' },
    { name: 'Deception', ability: 'charisma' },
    { name: 'History', ability: 'intelligence' },
    { name: 'Insight', ability: 'wisdom' },
    { name: 'Intimidation', ability: 'charisma' },
    { name: 'Investigation', ability: 'intelligence' },
    { name: 'Medicine', ability: 'wisdom' },
    { name: 'Nature', ability: 'intelligence' },
    { name: 'Perception', ability: 'wisdom' },
    { name: 'Performance', ability: 'charisma' },
    { name: 'Persuasion', ability: 'charisma' },
    { name: 'Religion', ability: 'intelligence' },
    { name: 'Sleight of Hand', ability: 'dexterity' },
    { name: 'Stealth', ability: 'dexterity' },
    { name: 'Survival', ability: 'wisdom' },
];

export const D5E_SPELL_SCHOOLS = [
    'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
    'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
];

export const parseSpellSlots = (json) => {
    if (!json) return {};
    try { return JSON.parse(json); } catch { return {}; }
};

export const serializeSpellSlots = (slots) => JSON.stringify(slots);

export const resetSpellSlots = (json) => {
    const slots = parseSpellSlots(json);
    const reset = {};
    for (const [level, data] of Object.entries(slots)) {
        reset[level] = { max: data.max, used: 0 };
    }
    return serializeSpellSlots(reset);
};
