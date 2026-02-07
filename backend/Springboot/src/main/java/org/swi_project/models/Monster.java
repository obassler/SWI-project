package org.swi_project.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.*;
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

    @NotBlank
    @Size(min = 1, max = 25)
    @Column(name = "Name", nullable = false, length = 25)
    private String name;

    @Size(max = 200)
    @Column(name = "Description", nullable = false, length = 200)
    private String description;

    @Min(1)
    @Column(name = "Health", nullable = false)
    private int health;

    @Min(0)
    @Column(name = "Attack", nullable = false)
    private int attack;

    @Min(0)
    @Column(name = "Defense", nullable = false)
    private int defense;

    @Column(name = "Boss", nullable = false)
    private boolean boss;

    @Size(max = 200)
    @Column(name = "Abilities", nullable = false, length = 200)
    private String abilities;

    @NotBlank
    @Size(max = 25)
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
