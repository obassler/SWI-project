package org.swi_project.DTO;

import org.swi_project.models.MonsterQuantityDTO;

import java.util.List;

public class UpdateLocationDTO {
    public String name;
    public String description;
    public List<Integer> npcIds;
    public List<MonsterQuantityDTO> monsters;
}
