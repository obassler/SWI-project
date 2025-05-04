package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Character;
import org.swi_project.models.Location;
import org.swi_project.models.Monster;
import org.swi_project.models.NPC;

import java.util.List;

public interface NPCRepository extends JpaRepository<NPC, Integer> {
    List<NPC> findByRole(String role);
    List<NPC> findByHostility(boolean hostility);
    List<NPC> findByLocationsContaining(Location location);
}
