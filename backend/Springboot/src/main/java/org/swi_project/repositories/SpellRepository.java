package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Spell;
import org.swi_project.models.SpellType;
import java.util.List;

public interface SpellRepository extends JpaRepository<Spell, Long> {
    List<Spell> findByOwnerId(Long characterId);
    List<Spell> findByLevel(int level);
    List<Spell> findByType(SpellType type);
}