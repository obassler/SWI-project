package org.swi_project.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;

import org.swi_project.models.Spell;
import org.swi_project.models.Character;
import org.swi_project.models.SpellType;
import org.swi_project.repositories.SpellRepository;
import org.swi_project.repositories.CharacterRepository;

@RestController
@RequestMapping("/api/spells")
public class SpellController {

    private final SpellRepository spellRepository;
    private final CharacterRepository characterRepository;

    @Autowired
    public SpellController(SpellRepository spellRepository, CharacterRepository characterRepository) {
        this.spellRepository = spellRepository;
        this.characterRepository = characterRepository;
    }

    @GetMapping
    public List<Spell> getAllSpells() {
        return spellRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Spell> getSpellById(@PathVariable Long id) {
        return spellRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Spell createSpell(@RequestBody Spell spell) {
        return spellRepository.save(spell);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Spell> updateSpell(@PathVariable Long id, @RequestBody Spell spellDetails) {
        return spellRepository.findById(id)
                .map(existingSpell -> {
                    existingSpell.setName(spellDetails.getName());
                    existingSpell.setDescription(spellDetails.getDescription());
                    existingSpell.setType(spellDetails.getType());
                    existingSpell.setLevel(spellDetails.getLevel());
                    return ResponseEntity.ok(spellRepository.save(existingSpell));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpell(@PathVariable Long id) {
        return spellRepository.findById(id)
                .map(spell -> {
                    spellRepository.delete(spell);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/character/{characterId}")
    public ResponseEntity<List<Spell>> getSpellsByCharacter(@PathVariable Long characterId) {
        if (!characterRepository.existsById(characterId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(spellRepository.findByOwnerId(characterId));
    }

    @PostMapping("/{spellId}/assign/{characterId}")
    public ResponseEntity<Spell> assignSpellToCharacter(
            @PathVariable Long spellId,
            @PathVariable Long characterId) {
        Optional<Spell> spellOpt = spellRepository.findById(spellId);
        Optional<Character> characterOpt = characterRepository.findById(characterId);

        if (spellOpt.isPresent() && characterOpt.isPresent()) {
            Spell spell = spellOpt.get();
            spell.setOwner(characterOpt.get());
            return ResponseEntity.ok(spellRepository.save(spell));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{spellId}/unassign")
    public ResponseEntity<Spell> unassignSpell(@PathVariable Long spellId) {
        return spellRepository.findById(spellId)
                .map(spell -> {
                    spell.setOwner(null);
                    return ResponseEntity.ok(spellRepository.save(spell));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/level/{level}")
    public List<Spell> getSpellsByLevel(@PathVariable int level) {
        return spellRepository.findByLevel(level);
    }

    @GetMapping("/type/{type}")
    public List<Spell> getSpellsByType(@PathVariable SpellType type) {
        return spellRepository.findByType(type);
    }
}