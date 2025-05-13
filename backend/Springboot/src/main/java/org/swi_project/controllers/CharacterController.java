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
        Character character = characterRepository.findById(id).orElseThrow();
        character.setName(updatedCharacter.getName());
        character.setLevel(updatedCharacter.getLevel());
        return characterRepository.save(character);
    }

    @PutMapping("/{id}/heal")
    public Character healCharacter(@PathVariable int id) {
        Character character = characterRepository.findById(id).orElseThrow();
        character.setCurrentHp(character.getMaxHp());
        return characterRepository.save(character);
    }

    @PutMapping("/heal-batch")
    public List<Character> healParty(@RequestBody List<Integer> characterIds) {
        List<Character> characters = characterRepository.findAllById(characterIds);
        for (Character character : characters) {
            character.setCurrentHp(character.getMaxHp());
        }
        return characterRepository.saveAll(characters);
    }

    @DeleteMapping("/{id}")
    public void deleteCharacter(@PathVariable int id) {
        characterRepository.deleteById(id);
    }
}
