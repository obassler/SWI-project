package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "quest")
public class Quest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Title", nullable = false, length = 25)
    private String title;

    @Column(name = "Description", nullable = false, length = 200)
    private String description;

    @Column(name = "Type", nullable = false, length = 25)
    private String type;

    @Column(name = "Completion", nullable = false)
    private boolean completion;

    @ManyToMany(mappedBy = "quests")
    private List<Character> participants = new ArrayList<>();
}