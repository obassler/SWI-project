package org.swi_project.DTO;

import lombok.Data;

import java.util.List;

@Data
public class LocationDTO {
    private String name;
    private String description;
    private List<Integer> monsterIds;
    private List<Integer> npcIds;
}
