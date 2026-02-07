package org.swi_project.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.*;
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

    @NotBlank
    @Size(min = 1, max = 25)
    @Column(name = "Name", nullable = false, length = 25)
    private String name;

    @Size(max = 200)
    @Column(name = "Description", nullable = false, length = 200)
    private String description;

    @NotBlank
    @Size(max = 25)
    @Column(name = "Type", nullable = false, length = 25)
    private String type;

    @Min(0)
    @Max(9)
    @Column(name = "Level", nullable = false)
    private int level;

    @ManyToMany(mappedBy = "spells")
    @JsonIgnoreProperties("spells")
    private List<Character> characters = new ArrayList<>();
}
