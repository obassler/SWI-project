package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.List;


@Getter
@Setter
@Entity
public class Monster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private int hp;
    private int attack;
    private int defense;
    private boolean isBoss;

    @ElementCollection
    private List<String> abilities;

    @Enumerated(EnumType.STRING)
    private CreatureType type;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character owner;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Item> loot;
}
