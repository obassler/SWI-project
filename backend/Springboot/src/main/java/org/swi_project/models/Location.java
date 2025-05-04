package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "location")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Name", nullable = false, length = 25)
    private String name;

    @Column(name = "Description", nullable = false, length = 200)
    private String description;

    @ManyToMany(mappedBy = "locations")
    private List<Monster> monsters = new ArrayList<>();

    @ManyToMany(mappedBy = "locations")
    private List<NPC> npcs = new ArrayList<>();
}