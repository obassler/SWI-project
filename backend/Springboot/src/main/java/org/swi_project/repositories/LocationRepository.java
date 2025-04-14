package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
