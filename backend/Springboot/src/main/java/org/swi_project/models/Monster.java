package org.swi_project.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "monster")
public class Monster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Name", nullable = false, length = 25)
    private String name;

    @Column(name = "Description", nullable = false, length = 200)
    private String description;

    @Column(name = "Health", nullable = false)
    private int health;

    @Column(name = "Attack", nullable = false)
    private int attack;

    @Column(name = "Defense", nullable = false)
    private int defense;

    @Column(name = "Boss", nullable = false)
    private boolean boss;

    @Column(name = "Abilities", nullable = false, length = 200)
    private String abilities;

    @Column(name = "Type", nullable = false, length = 25)
    private String type;

    @ManyToMany(mappedBy = "ownedMonsters")
    @JsonIgnoreProperties({"ownedMonsters", "items", "quests", "spells"})
    private List<Character> owners = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "lootdropped",
            joinColumns = @JoinColumn(name = "Monster_Id"),
            inverseJoinColumns = @JoinColumn(name = "Item_Id")
    )
    @JsonIgnoreProperties({"owner", "monsters"})
    private List<Item> loot = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "monster")
    private List<MonsterInLocation> locations;

}
