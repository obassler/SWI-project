package org.swi_project.repositories;

import org.swi_project.models.Race;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RaceRepository extends JpaRepository<Race, String> {
}