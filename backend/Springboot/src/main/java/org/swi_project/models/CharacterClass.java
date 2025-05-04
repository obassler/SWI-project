package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;
import javax.persistence.*;

@Entity
@Table(name = "characterclass")
@Getter
@Setter
public class CharacterClass {
    @Id
    @Column(name = "Name", length = 25)
    private String name;

    @Column(name = "DefaultWeapon", length = 25, nullable = false)
    private String defaultWeapon;

    @Column(name = "DefaultArmor", length = 25, nullable = false)
    private String defaultArmor;

    @Column(name = "DefaultSpellUsage", nullable = false)
    private int defaultSpellUsage;

    // Predefined class instances
    public static final CharacterClass BARBARIAN = create("BARBARIAN", "Greataxe", "Medium Armor", 0);
    public static final CharacterClass BARD = create("BARD", "Rapier", "Light Armor", 3);
    public static final CharacterClass CLERIC = create("CLERIC", "Mace", "Medium Armor", 3);
    public static final CharacterClass DRUID = create("DRUID", "Sickle", "Light Armor", 3);
    public static final CharacterClass FIGHTER = create("FIGHTER", "Longsword", "Heavy Armor", 0);
    public static final CharacterClass MONK = create("MONK", "Quarterstaff", "No Armor", 0);
    public static final CharacterClass PALADIN = create("PALADIN", "Longsword", "Heavy Armor", 2);
    public static final CharacterClass RANGER = create("RANGER", "Longbow", "Medium Armor", 2);
    public static final CharacterClass ROGUE = create("ROGUE", "Shortsword", "Light Armor", 0);
    public static final CharacterClass SORCERER = create("SORCERER", "Dagger", "No Armor", 4);
    public static final CharacterClass WARLOCK = create("WARLOCK", "Dagger", "Light Armor", 2);
    public static final CharacterClass WIZARD = create("WIZARD", "Staff", "No Armor", 4);

    private static CharacterClass create(String name, String defaultWeapon, String defaultArmor, int defaultSpellUsage) {
        CharacterClass cc = new CharacterClass();
        cc.setName(name);
        cc.setDefaultWeapon(defaultWeapon);
        cc.setDefaultArmor(defaultArmor);
        cc.setDefaultSpellUsage(defaultSpellUsage);
        return cc;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CharacterClass that = (CharacterClass) o;
        return name.equals(that.name);
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