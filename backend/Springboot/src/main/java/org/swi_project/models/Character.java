package org.swi_project.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    @Column(name = "Name", nullable = false, length = 25)
    private String name;

    @ManyToOne
    @JoinColumn(name = "CharacterClass_Name", nullable = false)
    private CharacterClass characterClass;

    @ManyToOne
    @JoinColumn(name = "Race_Name", nullable = false)
    private Race race;

    @Column(name = "Level", nullable = false)
    private int level = 1;

    @Column(name = "MaxHP", nullable = false)
    private int maxHp;

    @Column(name = "CurrentHP", nullable = false)
    private int currentHp;

    @Column(name = "Strength", nullable = false)
    private int strength;

    @Column(name = "Dexterity", nullable = false)
    private int dexterity;

    @Column(name = "Constitution", nullable = false)
    private int constitution;

    @Column(name = "Intelligence", nullable = false)
    private int intelligence;

    @Column(name = "Wisdom", nullable = false)
    private int wisdom;

    @Column(name = "Charisma", nullable = false)
    private int charisma;

    @Column(name = "Status", nullable = false, length = 25)
    private String status;

    @Column(name = "Background", nullable = false, length = 200)
    private String background;

    @Column(name = "Alignment", nullable = false, length = 200)
    private String alignment;

    @Column(name = "Specialization", nullable = false, length = 25)
    private String specialization;

    @Column(name = "Notes", nullable = false, length = 2000)
    private String notes;

    @ManyToMany
    @JoinTable(
            name = "charspells",
            joinColumns = @JoinColumn(name = "Character_Id"),
            inverseJoinColumns = @JoinColumn(name = "Spell_Id")
    )
    @JsonIgnoreProperties("characters") // ignore loop back
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
    private List<Quest> quests = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "ownedmonsterbychar",
            joinColumns = @JoinColumn(name = "Character_Id"),
            inverseJoinColumns = @JoinColumn(name = "Monster_Id")
    )
    private List<Monster> ownedMonsters = new ArrayList<>();

    public void addSpell(Spell spell) {
        this.spells.add(spell);
        spell.getCharacters().add(this);
    }

    public void removeSpell(Spell spell) {
        this.spells.remove(spell);
        spell.getCharacters().remove(this);
    }
}