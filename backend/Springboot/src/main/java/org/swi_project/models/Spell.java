package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
public class Spell {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private SpellType type;
    private int level;


    @ManyToMany
    @JoinColumn(name = "character_id")
    private Character owner;
}
