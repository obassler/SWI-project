package org.swi_project.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.swi_project.models.Spell;
import org.swi_project.repositories.SpellRepository;

import java.util.List;

@RestController
@RequestMapping("/api/spells")
public class SpellController {

    private final SpellRepository spellRepository;

    @Autowired
    public SpellController(SpellRepository spellRepository) {
        this.spellRepository = spellRepository;
    }

    @GetMapping
    public List<Spell> getAllSpells() {
        return spellRepository.findAll();
    }

    @GetMapping("/{id}")
    public Spell getSpell(@PathVariable Integer id) {
        return spellRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Spell createSpell(@RequestBody Spell spell) {
        return spellRepository.save(spell);
    }
}
