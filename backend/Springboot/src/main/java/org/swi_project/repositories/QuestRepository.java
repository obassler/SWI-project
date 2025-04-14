package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Quest;

public interface QuestRepository extends JpaRepository<Quest, Long> {
}
