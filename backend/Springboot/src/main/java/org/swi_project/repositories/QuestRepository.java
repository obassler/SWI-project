package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Quest;

import java.util.List;

public interface QuestRepository extends JpaRepository<Quest, Integer> {
    List<Quest> findByCompletion(boolean completion);
    List<Quest> findByType(String type);
    List<Quest> findByParticipantsContaining(Character character);
}
