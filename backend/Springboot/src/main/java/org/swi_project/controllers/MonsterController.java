package org.swi_project.controllers;

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
    public Monster getMonster(@PathVariable int id) {
        return monsterRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Monster createMonster(@RequestBody Monster monster) {
        return monsterRepository.save(monster);
    }

    @PutMapping("/{id}")
    public Monster updateMonster(@PathVariable int id, @RequestBody Monster updatedMonster) {
        Monster monster = monsterRepository.findById(id).orElseThrow();
        monster.setName(updatedMonster.getName());
        monster.setHealth(updatedMonster.getHealth());
        return monsterRepository.save(monster);
    }

    @DeleteMapping("/{id}")
    public void deleteMonster(@PathVariable int id) {
        monsterRepository.deleteById(id);
    }
}
