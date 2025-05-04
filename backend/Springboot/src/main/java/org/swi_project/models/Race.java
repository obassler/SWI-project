package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;
import javax.persistence.*;

@Entity
@Table(name = "race")
@Getter
@Setter
public class Race {
    @Id
    @Column(name = "Name", length = 25)
    private String name;

    @Column(name = "AbilityBonus", length = 200, nullable = false)
    private String abilityBonus;

    @Column(name = "BaseSpeed", nullable = false)
    private int baseSpeed;

    public static final Race HUMAN = create("HUMAN", "+1 to all ability scores", 30);
    public static final Race ELF = create("ELF", "+2 Dexterity, +1 Intelligence", 30);
    public static final Race DWARF = create("DWARF", "+2 Constitution, +1 Wisdom", 25);
    public static final Race HALFLING = create("HALFLING", "+2 Dexterity, +1 Charisma", 25);
    public static final Race DRAGONBORN = create("DRAGONBORN", "+2 Strength, +1 Charisma", 30);
    public static final Race GNOME = create("GNOME", "+2 Intelligence, +1 Constitution", 25);
    public static final Race HALF_ELF = create("HALF_ELF", "+2 Charisma, +1 to two other ability scores", 30);
    public static final Race HALF_ORC = create("HALF_ORC", "+2 Strength, +1 Constitution", 30);
    public static final Race TIEFLING = create("TIEFLING", "+2 Charisma, +1 Intelligence", 30);

    private static Race create(String name, String abilityBonus, int baseSpeed) {
        Race race = new Race();
        race.setName(name);
        race.setAbilityBonus(abilityBonus);
        race.setBaseSpeed(baseSpeed);
        return race;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Race race = (Race) o;
        return name.equals(race.name);
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }

    @Override
    public String toString() {
        return name;
    }
}