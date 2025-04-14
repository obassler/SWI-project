package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Character;

public interface CharacterRepository extends JpaRepository<Character, Long> {
}
