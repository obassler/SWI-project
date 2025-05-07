package org.swi_project.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.swi_project.models.Monster;
import org.swi_project.repositories.MonsterRepository;

import java.util.List;

@RestController
@RequestMapping("/api/monsters")
public class MonsterController {

    private final MonsterRepository monsterRepository;

    public MonsterController(MonsterRepository monsterRepository) {
        this.monsterRepository = monsterRepository;
    }

    @GetMapping
    public List<Monster> getAllMonsters() {
        return monsterRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Monster> getMonster(@PathVariable Integer id) {
        return monsterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Monster createMonster(@RequestBody Monster monster) {
        return monsterRepository.save(monster);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Monster> updateMonster(@PathVariable Integer id, @RequestBody Monster updated) {
        return monsterRepository.findById(id)
                .map(monster -> {
                    monster.setName(updated.getName());
                    monster.setDescription(updated.getDescription());
                    monster.setHealth(updated.getHealth());
                    monster.setAttack(updated.getAttack());
                    monster.setDefense(updated.getDefense());
                    monster.setBoss(updated.isBoss());
                    monster.setAbilities(updated.getAbilities());
                    monster.setType(updated.getType());
                    return ResponseEntity.ok(monsterRepository.save(monster));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMonster(@PathVariable Integer id) {
        if (monsterRepository.existsById(id)) {
            monsterRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
