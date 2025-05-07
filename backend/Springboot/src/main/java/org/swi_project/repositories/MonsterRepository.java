package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Monster;

public interface MonsterRepository extends JpaRepository<Monster, Integer> {
}
