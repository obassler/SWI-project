package org.swi_project.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.swi_project.exception.ResourceNotFoundException;
import org.swi_project.models.Character;
import org.swi_project.models.CharacterStatus;
import org.swi_project.models.Item;
import org.swi_project.models.Spell;
import org.swi_project.repositories.CharacterRepository;
import org.swi_project.repositories.ItemRepository;
import org.swi_project.repositories.SpellRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
@Slf4j
public class CharacterController {

    private final CharacterRepository characterRepository;
    private final ItemRepository itemRepository;
    private final SpellRepository spellRepository;

    @GetMapping
    public List<Character> getAllCharacters() {
        return characterRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Character> getCharacter(@PathVariable int id) {
        return characterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));
    }

    @PostMapping
    public ResponseEntity<Character> createCharacter(@Valid @RequestBody Character character) {
        Character saved = characterRepository.save(character);
        log.info("Created character: {}", saved.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Character> updateCharacter(@PathVariable int id, @Valid @RequestBody Character updatedCharacter) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));

        character.setName(updatedCharacter.getName());
        character.setLevel(updatedCharacter.getLevel());
        character.setRace(updatedCharacter.getRace());
        character.setCharacterClass(updatedCharacter.getCharacterClass());
        character.setStatus(updatedCharacter.getStatus());
        character.setBackground(updatedCharacter.getBackground());
        character.setAlignment(updatedCharacter.getAlignment());
        character.setSpecialization(updatedCharacter.getSpecialization());
        character.setNotes(updatedCharacter.getNotes());
        character.setStrength(updatedCharacter.getStrength());
        character.setDexterity(updatedCharacter.getDexterity());
        character.setConstitution(updatedCharacter.getConstitution());
        character.setIntelligence(updatedCharacter.getIntelligence());
        character.setWisdom(updatedCharacter.getWisdom());
        character.setCharisma(updatedCharacter.getCharisma());
        character.setCurrentHp(updatedCharacter.getCurrentHp());
        character.setMaxHp(updatedCharacter.getMaxHp());
        character.setArmorClass(updatedCharacter.getArmorClass());
        character.setExperiencePoints(updatedCharacter.getExperiencePoints());
        character.setDeathSaveSuccesses(updatedCharacter.getDeathSaveSuccesses());
        character.setDeathSaveFailures(updatedCharacter.getDeathSaveFailures());
        character.setSpellSlots(updatedCharacter.getSpellSlots());
        character.getConditions().clear();
        if (updatedCharacter.getConditions() != null) {
            character.getConditions().addAll(updatedCharacter.getConditions());
        }
        character.getSkillProficiencies().clear();
        if (updatedCharacter.getSkillProficiencies() != null) {
            character.getSkillProficiencies().addAll(updatedCharacter.getSkillProficiencies());
        }

        log.debug("Updated character id={}", id);
        return ResponseEntity.ok(characterRepository.save(character));
    }

    @PutMapping("/{id}/heal")
    @Transactional
    public ResponseEntity<Character> healCharacter(@PathVariable int id) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));
        character.setCurrentHp(character.getMaxHp());
        character.setStatus(CharacterStatus.ACTIVE);
        character.setDeathSaveSuccesses(0);
        character.setDeathSaveFailures(0);
        return ResponseEntity.ok(characterRepository.save(character));
    }

    @PutMapping("/{id}/damage")
    @Transactional
    public ResponseEntity<Character> damageCharacter(@PathVariable int id, @RequestParam int amount) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));
        int newHp = Math.max(0, character.getCurrentHp() - amount);
        character.setCurrentHp(newHp);
        if (newHp == 0) {
            character.setStatus(CharacterStatus.DECEASED);
        }
        return ResponseEntity.ok(characterRepository.save(character));
    }

    @PutMapping("/{id}/heal-amount")
    @Transactional
    public ResponseEntity<Character> healCharacterAmount(@PathVariable int id, @RequestParam int amount) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));
        int newHp = Math.min(character.getMaxHp(), character.getCurrentHp() + amount);
        character.setCurrentHp(newHp);
        if (character.getStatus() == CharacterStatus.DECEASED && newHp > 0) {
            character.setStatus(CharacterStatus.ACTIVE);
        }
        return ResponseEntity.ok(characterRepository.save(character));
    }

    @PutMapping("/heal-batch")
    @Transactional
    public ResponseEntity<List<Character>> healParty(@RequestBody List<Integer> characterIds) {
        List<Character> characters = characterRepository.findAllById(characterIds);
        for (Character character : characters) {
            character.setCurrentHp(character.getMaxHp());
            character.setStatus(CharacterStatus.ACTIVE);
            character.setDeathSaveSuccesses(0);
            character.setDeathSaveFailures(0);
        }
        return ResponseEntity.ok(characterRepository.saveAll(characters));
    }

    @PostMapping("/{id}/death-save")
    @Transactional
    public ResponseEntity<Character> deathSave(@PathVariable int id, @RequestParam boolean success) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));
        if (success) {
            character.setDeathSaveSuccesses(character.getDeathSaveSuccesses() + 1);
            if (character.getDeathSaveSuccesses() >= 3) {
                character.setStatus(CharacterStatus.ACTIVE);
                character.setCurrentHp(1);
                character.setDeathSaveSuccesses(0);
                character.setDeathSaveFailures(0);
            }
        } else {
            character.setDeathSaveFailures(character.getDeathSaveFailures() + 1);
            if (character.getDeathSaveFailures() >= 3) {
                character.setStatus(CharacterStatus.DECEASED);
                character.setDeathSaveSuccesses(0);
                character.setDeathSaveFailures(0);
            }
        }
        return ResponseEntity.ok(characterRepository.save(character));
    }

    @PutMapping("/{id}/conditions")
    @Transactional
    public ResponseEntity<Character> updateConditions(@PathVariable int id, @RequestBody java.util.Set<String> conditions) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));
        character.getConditions().clear();
        character.getConditions().addAll(conditions);
        return ResponseEntity.ok(characterRepository.save(character));
    }

    @PutMapping("/{id}/spell-slots")
    @Transactional
    public ResponseEntity<Character> updateSpellSlots(@PathVariable int id, @RequestBody Map<String, Object> body) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));
        try {
            character.setSpellSlots(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(body));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(characterRepository.save(character));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable int id) {
        if (!characterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Character", id);
        }
        characterRepository.deleteById(id);
        log.info("Deleted character id={}", id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{characterId}/items/{itemId}")
    @Transactional
    public ResponseEntity<?> assignItemToCharacter(
            @PathVariable int characterId,
            @PathVariable int itemId) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("Character", characterId));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));

        if (character.getItems().contains(item)) {
            return ResponseEntity.ok(character);
        }

        long weapons = character.getItems().stream().filter(Item::isWeapon).count();
        long rings = character.getItems().stream()
                .filter(i -> i.getType() == org.swi_project.models.ItemType.RING).count();

        if (item.isWeapon() && weapons >= 2) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Character can't carry more than 2 weapons."));
        }
        if (item.getType() == org.swi_project.models.ItemType.RING && rings >= 4) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Character can't wear more than 4 rings."));
        }

        character.addItem(item);
        characterRepository.save(character);
        log.info("Assigned item {} to character {}", item.getName(), character.getName());
        return ResponseEntity.ok(character);
    }

    @DeleteMapping("/{characterId}/items/{itemId}")
    @Transactional
    public ResponseEntity<Character> removeItemFromCharacter(
            @PathVariable int characterId,
            @PathVariable int itemId) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("Character", characterId));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));

        character.removeItem(item);
        item.setEquipState(false);
        itemRepository.save(item);
        characterRepository.save(character);
        log.info("Removed item {} from character {}", item.getName(), character.getName());
        return ResponseEntity.ok(character);
    }

    @PostMapping("/{characterId}/spells/{spellId}")
    @Transactional
    public ResponseEntity<Character> assignSpellToCharacter(
            @PathVariable int characterId,
            @PathVariable int spellId) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("Character", characterId));
        Spell spell = spellRepository.findById(spellId)
                .orElseThrow(() -> new ResourceNotFoundException("Spell", spellId));

        if (!character.getSpells().contains(spell)) {
            character.addSpell(spell);
            characterRepository.save(character);
            log.info("Assigned spell {} to character {}", spell.getName(), character.getName());
        }
        return ResponseEntity.ok(character);
    }

    @DeleteMapping("/{characterId}/spells/{spellId}")
    @Transactional
    public ResponseEntity<Character> removeSpellFromCharacter(
            @PathVariable int characterId,
            @PathVariable int spellId) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("Character", characterId));
        Spell spell = spellRepository.findById(spellId)
                .orElseThrow(() -> new ResourceNotFoundException("Spell", spellId));

        character.removeSpell(spell);
        characterRepository.save(character);
        log.info("Removed spell {} from character {}", spell.getName(), character.getName());
        return ResponseEntity.ok(character);
    }

    @PostMapping("/{characterId}/equip")
    @Transactional
    public ResponseEntity<?> equipItemForCharacter(
            @PathVariable int characterId,
            @RequestBody Map<String, Object> body) {
        Object itemIdObj = body.get("itemId");
        Object equipObj = body.get("equip");
        if (!(itemIdObj instanceof Number) || !(equipObj instanceof Boolean)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Request must include 'itemId' (number) and 'equip' (boolean)."));
        }
        int itemId = ((Number) itemIdObj).intValue();
        boolean equip = (Boolean) equipObj;

        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("Character", characterId));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));

        if (!character.getItems().contains(item)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Character does not own this item."));
        }

        if (equip) {
            if (!item.isEquippable()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "This item cannot be equipped."));
            }
            item.equip();
        } else {
            item.unequip();
        }

        itemRepository.save(item);
        return ResponseEntity.ok(character);
    }
}
