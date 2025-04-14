package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Item;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByOwner(org.swi_project.models.Character owner);
}
