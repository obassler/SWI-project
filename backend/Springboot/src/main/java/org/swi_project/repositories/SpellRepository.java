package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.swi_project.models.Spell;

import java.util.List;

public interface SpellRepository extends JpaRepository<Spell, Integer> {
    @Query("SELECT s FROM Spell s JOIN s.characters c WHERE c.id = :characterId")
    List<Spell> findByCharacterId(@Param("characterId") Integer characterId);
    List<Spell> findByLevel(int level);
    List<Spell> findByType(String type);
}