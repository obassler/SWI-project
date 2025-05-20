package org.swi_project.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @PutMapping("/{id}")
    public ResponseEntity<Spell> updateSpell(@PathVariable Integer id, @RequestBody Spell updatedSpell) {
        System.out.println(id);
        System.out.println(updatedSpell.getId());
        System.out.println(updatedSpell.getDescription());
        System.out.println(updatedSpell.getName());
        System.out.println(updatedSpell.getLevel());

        return spellRepository.findById(id)
                .map(spell -> {
                    spell.setName(updatedSpell.getName());
                    spell.setDescription(updatedSpell.getDescription());
                    spell.setType(updatedSpell.getType());
                    spell.setLevel(updatedSpell.getLevel());
                    Spell savedSpell = spellRepository.save(spell);
                    return ResponseEntity.ok(savedSpell);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpell(@PathVariable Integer id) {
        if (!spellRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        spellRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // 204
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
