package org.swi_project.repositories;

import org.swi_project.models.CharacterClass;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CharacterClassRepository extends JpaRepository<CharacterClass, String> {
}
