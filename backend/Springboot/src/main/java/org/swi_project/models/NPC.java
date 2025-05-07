package org.swi_project.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "npc")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NPC {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 25)
    private String name;

    @Column(nullable = false, length = 25)
    private String role;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(nullable = false)
    private boolean hostility;

    @ManyToOne
    @JoinColumn(name = "location_id")
    @JsonBackReference
    private Location location;
}
