package org.swi_project.controllers;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;

import org.swi_project.models.Spell;
import org.swi_project.models.Character;
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
    public ResponseEntity<Spell> getSpellById(@PathVariable int id) {
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
    public ResponseEntity<Spell> updateSpell(@PathVariable int id, @RequestBody Spell spellDetails) {
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
    public ResponseEntity<Void> deleteSpell(@PathVariable int id) {
        return spellRepository.findById(id)
                .map(spell -> {
                    spellRepository.delete(spell);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/character/{characterId}")
    public ResponseEntity<List<Spell>> getSpellsByCharacter(@PathVariable int characterId) {
        if (!characterRepository.existsById(characterId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(spellRepository.findByCharacterId(characterId));
    }

    @PostMapping("/{spellId}/assign/{characterId}")
    @Transactional
    public ResponseEntity<Spell> assignSpellToCharacter(
            @PathVariable Integer spellId,
            @PathVariable Integer characterId) {
        Optional<Character> characterOpt = characterRepository.findById(characterId);
        Optional<Spell> spellOpt = spellRepository.findById(spellId);

        if (characterOpt.isPresent() && spellOpt.isPresent()) {
            Character character = characterOpt.get();
            Spell spell = spellOpt.get();
            character.addSpell(spell);
            characterRepository.save(character);
            return ResponseEntity.ok(spell);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{spellId}/unassign/{characterId}")
    @Transactional
    public ResponseEntity<?> unassignSpellFromCharacter(
            @PathVariable Integer spellId,
            @PathVariable Integer characterId) {
        return characterRepository.findById(characterId)
                .flatMap(character -> spellRepository.findById(spellId)
                        .map(spell -> {
                            character.removeSpell(spell);
                            characterRepository.save(character);
                            return ResponseEntity.ok().build();
                        }))
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/level/{level}")
    public List<Spell> getSpellsByLevel(@PathVariable int level) {
        return spellRepository.findByLevel(level);
    }
}