package org.swi_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.swi_project.models.Character;
import org.swi_project.models.Item;

import javax.persistence.criteria.CriteriaBuilder;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Integer> {
    List<Item> findByOwner(Character owner);
}
