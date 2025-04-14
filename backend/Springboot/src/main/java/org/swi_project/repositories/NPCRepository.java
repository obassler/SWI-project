package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.NPC;

public interface NPCRepository extends JpaRepository<NPC, Long> {
}
