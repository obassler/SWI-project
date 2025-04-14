package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
public class NPC {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Roles role;
    private String description;

    private boolean hostile;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
}
