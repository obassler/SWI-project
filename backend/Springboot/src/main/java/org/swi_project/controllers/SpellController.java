package org.swi_project.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.swi_project.exception.ResourceNotFoundException;
import org.swi_project.models.Spell;
import org.swi_project.repositories.SpellRepository;

import java.util.List;

@RestController
@RequestMapping("/api/spells")
@RequiredArgsConstructor
@Slf4j
public class SpellController {

    private final SpellRepository spellRepository;

    @GetMapping
    public List<Spell> getAllSpells() {
        return spellRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Spell> getSpell(@PathVariable Integer id) {
        return spellRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Spell", id));
    }

    @PostMapping
    public ResponseEntity<Spell> createSpell(@Valid @RequestBody Spell spell) {
        Spell saved = spellRepository.save(spell);
        log.info("Created spell: {}", saved.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Spell> updateSpell(@PathVariable Integer id, @Valid @RequestBody Spell updatedSpell) {
        Spell spell = spellRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spell", id));

        spell.setName(updatedSpell.getName());
        spell.setDescription(updatedSpell.getDescription());
        spell.setType(updatedSpell.getType());
        spell.setLevel(updatedSpell.getLevel());

        log.debug("Updated spell id={}", id);
        return ResponseEntity.ok(spellRepository.save(spell));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpell(@PathVariable Integer id) {
        if (!spellRepository.existsById(id)) {
            throw new ResourceNotFoundException("Spell", id);
        }
        spellRepository.deleteById(id);
        log.info("Deleted spell id={}", id);
        return ResponseEntity.noContent().build();
    }
}
