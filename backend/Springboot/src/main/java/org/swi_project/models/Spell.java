package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
public class Ability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private AbilityType type;

    private int damage;
    private int healing;
    private int buffAmount;
    private int debuffAmount;
    private int cooldown;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character owner;
}
