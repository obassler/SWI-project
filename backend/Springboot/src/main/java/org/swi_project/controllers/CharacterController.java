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

        log.debug("Updated character id={}", id);
        return ResponseEntity.ok(characterRepository.save(character));
    }

    @PutMapping("/{id}/heal")
    public ResponseEntity<Character> healCharacter(@PathVariable int id) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));
        character.setCurrentHp(character.getMaxHp());
        character.setStatus("Živý");
        return ResponseEntity.ok(characterRepository.save(character));
    }

    @PutMapping("/heal-batch")
    public ResponseEntity<List<Character>> healParty(@RequestBody List<Integer> characterIds) {
        List<Character> characters = characterRepository.findAllById(characterIds);
        for (Character character : characters) {
            character.setCurrentHp(character.getMaxHp());
            character.setStatus("Živý");
        }
        return ResponseEntity.ok(characterRepository.saveAll(characters));
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
                .filter(i -> "RING".equalsIgnoreCase(i.getType())).count();

        if (item.isWeapon() && weapons >= 2) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Character can't carry more than 2 weapons."));
        }
        if ("RING".equalsIgnoreCase(item.getType()) && rings >= 4) {
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
        int itemId = ((Number) body.get("itemId")).intValue();
        boolean equip = (boolean) body.get("equip");

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
