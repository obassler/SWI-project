package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Monster;

import java.util.List;

public interface MonsterRepository extends JpaRepository<Monster, Integer> {
    List<Monster> findByType(String type);
    List<Monster> findByBoss(boolean isBoss);
    List<Monster> findByOwnersContaining(Character owner);
}
