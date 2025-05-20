package org.swi_project.controllers;

import org.springframework.web.bind.annotation.*;
import org.swi_project.models.Character;
import org.swi_project.repositories.CharacterRepository;

import java.util.List;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    private final CharacterRepository characterRepository;

    public CharacterController(CharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

    @GetMapping
    public List<Character> getAllCharacters() {
        return characterRepository.findAll();
    }

    @GetMapping("/{id}")
    public Character getCharacter(@PathVariable int id) {
        return characterRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Character createCharacter(@RequestBody Character character) {
        return characterRepository.save(character);
    }

    @PutMapping("/{id}")
    public Character updateCharacter(@PathVariable int id, @RequestBody Character updatedCharacter) {
        Character character = characterRepository.findById(id).orElseThrow(() -> new RuntimeException("Character not found"));

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
        character.setItems(updatedCharacter.getItems());
        character.setSpells(updatedCharacter.getSpells());

        return characterRepository.save(character);
    }


    @PutMapping("/{id}/heal")
    public Character healCharacter(@PathVariable int id) {
        Character character = characterRepository.findById(id).orElseThrow();
        character.setCurrentHp(character.getMaxHp());
        character.setStatus("Živý");
        return characterRepository.save(character);
    }

    @PutMapping("/heal-batch")
    public List<Character> healParty(@RequestBody List<Integer> characterIds) {
        List<Character> characters = characterRepository.findAllById(characterIds);
        for (Character character : characters) {
            character.setCurrentHp(character.getMaxHp());
            character.setStatus("Živý");
        }
        return characterRepository.saveAll(characters);
    }

    @DeleteMapping("/{id}")
    public void deleteCharacter(@PathVariable int id) {
        characterRepository.deleteById(id);
    }
}
