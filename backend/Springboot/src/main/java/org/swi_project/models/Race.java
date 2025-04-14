package org.swi_project.models;

import lombok.Getter;

@Getter
public enum Race {
    HUMAN("+1 to all ability scores", 30),
    ELF("+2 Dexterity, +1 Intelligence", 30),
    DWARF("+2 Constitution, +1 Wisdom", 25),
    HALFLING("+2 Dexterity, +1 Charisma", 25),
    DRAGONBORN("+2 Strength, +1 Charisma", 30),
    GNOME("+2 Intelligence, +1 Constitution", 25),
    HALF_ELF("+2 Charisma, +1 to two other ability scores", 30),
    HALF_ORC("+2 Strength, +1 Constitution", 30),
    TIEFLING("+2 Charisma, +1 Intelligence", 30);

    private final String abilityBonuses;
    private final int baseSpeed;

    Race(String abilityBonuses, int baseSpeed) {
        this.abilityBonuses = abilityBonuses;
        this.baseSpeed = baseSpeed;
    }

}