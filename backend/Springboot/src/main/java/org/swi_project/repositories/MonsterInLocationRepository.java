package org.swi_project.repositories;

import org.swi_project.models.MonsterInLocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonsterInLocationRepository extends JpaRepository<MonsterInLocation, Integer> {
    void deleteByLocationId(int locationId);
}
