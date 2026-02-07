package org.swi_project.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "game_character")
public class Character {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @NotBlank
    @Size(min = 1, max = 25)
    @Column(name = "Name", nullable = false, length = 25)
    private String name;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "CharacterClass_Name", nullable = false)
    private CharacterClass characterClass;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "Race_Name", nullable = false)
    private Race race;

    @Min(1)
    @Max(20)
    @Column(name = "Level", nullable = false)
    private int level = 1;

    @Min(1)
    @Column(name = "MaxHP", nullable = false)
    private int maxHp;

    @Min(0)
    @Column(name = "CurrentHP", nullable = false)
    private int currentHp;

    @Min(1)
    @Max(30)
    @Column(name = "Strength", nullable = false)
    private int strength;

    @Min(1)
    @Max(30)
    @Column(name = "Dexterity", nullable = false)
    private int dexterity;

    @Min(1)
    @Max(30)
    @Column(name = "Constitution", nullable = false)
    private int constitution;

    @Min(1)
    @Max(30)
    @Column(name = "Intelligence", nullable = false)
    private int intelligence;

    @Min(1)
    @Max(30)
    @Column(name = "Wisdom", nullable = false)
    private int wisdom;

    @Min(1)
    @Max(30)
    @Column(name = "Charisma", nullable = false)
    private int charisma;

    @NotBlank
    @Size(max = 25)
    @Column(name = "Status", nullable = false, length = 25)
    private String status;

    @Size(max = 200)
    @Column(name = "Background", nullable = false, length = 200)
    private String background;

    @Size(max = 200)
    @Column(name = "Alignment", nullable = false, length = 200)
    private String alignment;

    @Size(max = 25)
    @Column(name = "Specialization", nullable = false, length = 25)
    private String specialization;

    @Size(max = 2000)
    @Column(name = "Notes", nullable = false, length = 2000)
    private String notes;

    @ManyToMany
    @JoinTable(
            name = "charspells",
            joinColumns = @JoinColumn(name = "Character_Id"),
            inverseJoinColumns = @JoinColumn(name = "Spell_Id")
    )
    @JsonIgnoreProperties("characters")
    private List<Spell> spells = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "charitems",
            joinColumns = @JoinColumn(name = "Character_Id"),
            inverseJoinColumns = @JoinColumn(name = "Item_Id")
    )
    private List<Item> items = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "charquest",
            joinColumns = @JoinColumn(name = "Character_Id"),
            inverseJoinColumns = @JoinColumn(name = "Quest_Id")
    )
    @JsonIgnoreProperties({"participants"})
    private List<Quest> quests = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "ownedmonsterbychar",
            joinColumns = @JoinColumn(name = "Character_Id"),
            inverseJoinColumns = @JoinColumn(name = "Monster_Id")
    )
    @JsonIgnoreProperties({"owners", "locations"})
    private List<Monster> ownedMonsters = new ArrayList<>();

    public void addSpell(Spell spell) {
        this.spells.add(spell);
        spell.getCharacters().add(this);
    }

    public void removeSpell(Spell spell) {
        this.spells.remove(spell);
        spell.getCharacters().remove(this);
    }

    public void addItem(Item item) {
        this.items.add(item);
    }

    public void removeItem(Item item) {
        this.items.remove(item);
    }
}
