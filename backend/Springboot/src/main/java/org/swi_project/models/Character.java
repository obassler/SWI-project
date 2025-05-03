package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;
import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "game_character")
public class Character {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private CharacterClass characterClass;

    @Enumerated(EnumType.STRING)
    private Race race;

    private int level = 1;
    private int maxHp;
    private int currentHp;

    private int strength;
    private int dexterity;
    private int constitution;
    private int intelligence;
    private int wisdom;
    private int charisma;

    @Enumerated(EnumType.STRING)
    private CharacterStatus status = CharacterStatus.ACTIVE;

    private String background;
    private String alignment;
    private Specialization specialization;

    @Column(length = 1000)
    private String notes;

    @ManyToMany(mappedBy = "owner")
    private List<Spell> knownSpells = new ArrayList<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Item> inventory = new ArrayList<>();
}
