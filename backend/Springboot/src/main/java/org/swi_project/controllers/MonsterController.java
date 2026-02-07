package org.swi_project.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.swi_project.exception.ResourceNotFoundException;
import org.swi_project.models.Monster;
import org.swi_project.repositories.MonsterRepository;

import java.util.List;

@RestController
@RequestMapping("/api/monsters")
@RequiredArgsConstructor
@Slf4j
public class MonsterController {

    private final MonsterRepository monsterRepository;

    @GetMapping
    public List<Monster> getAllMonsters() {
        return monsterRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Monster> getMonster(@PathVariable Integer id) {
        return monsterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Monster", id));
    }

    @PostMapping
    public ResponseEntity<Monster> createMonster(@Valid @RequestBody Monster monster) {
        Monster saved = monsterRepository.save(monster);
        log.info("Created monster: {}", saved.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Monster> updateMonster(@PathVariable Integer id, @Valid @RequestBody Monster updated) {
        Monster monster = monsterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Monster", id));

        monster.setName(updated.getName());
        monster.setDescription(updated.getDescription());
        monster.setHealth(updated.getHealth());
        monster.setAttack(updated.getAttack());
        monster.setDefense(updated.getDefense());
        monster.setBoss(updated.isBoss());
        monster.setAbilities(updated.getAbilities());
        monster.setType(updated.getType());

        log.debug("Updated monster id={}", id);
        return ResponseEntity.ok(monsterRepository.save(monster));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMonster(@PathVariable Integer id) {
        if (!monsterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Monster", id);
        }
        monsterRepository.deleteById(id);
        log.info("Deleted monster id={}", id);
        return ResponseEntity.noContent().build();
    }
}
