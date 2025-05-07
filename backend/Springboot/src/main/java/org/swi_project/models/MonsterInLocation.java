package org.swi_project.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "monstersinlocation")
public class MonsterInLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    @JsonIgnoreProperties("monstersInLocation")
    private Location location;

    @ManyToOne
    @JoinColumn(name = "monster_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Monster monster;


    private int quantity;
}
