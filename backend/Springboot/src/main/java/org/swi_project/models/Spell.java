package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "spell")
public class Spell {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Name", nullable = false, length = 25)
    private String name;

    @Column(name = "Description", nullable = false, length = 200)
    private String description;

    @Column(name = "Type", nullable = false, length = 25)
    private String type;

    @Column(name = "Level", nullable = false)
    private int level;

    @ManyToMany(mappedBy = "spells")
    private List<Character> characters = new ArrayList<>();
}