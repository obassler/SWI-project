package org.swi_project.models;

import lombok.Getter;

@Getter
public enum CharacterClass {
    BARBARIAN("Greataxe", "Medium Armor", 0),
    BARD("Rapier", "Light Armor", 3),
    CLERIC("Mace", "Medium Armor", 3),
    DRUID("Scimitar", "Light Armor", 3),
    FIGHTER("Longsword", "Heavy Armor", 0),
    MONK("Quarterstaff", "No Armor", 0),
    PALADIN("Longsword", "Heavy Armor", 2),
    RANGER("Longbow", "Medium Armor", 2),
    ROGUE("Shortsword", "Light Armor", 0),
    SORCERER("Dagger", "No Armor", 4),
    WARLOCK("Dagger", "Light Armor", 2),
    WIZARD("Staff", "No Armor", 4);

    private final String defaultWeapon;
    private final String defaultArmor;
    private final int defaultSpellUsage;

    CharacterClass(String defaultWeapon, String defaultArmor, int defaultSpellUsage) {
        this.defaultWeapon = defaultWeapon;
        this.defaultArmor = defaultArmor;
        this.defaultSpellUsage = defaultSpellUsage;
    }
}