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
    public Character getCharacter(@PathVariable Long id) {
        return characterRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Character createCharacter(@RequestBody Character character) {
        return characterRepository.save(character);
    }

    @PutMapping("/{id}")
    public Character updateCharacter(@PathVariable Long id, @RequestBody Character updatedCharacter) {
        Character character = characterRepository.findById(id).orElseThrow();
        character.setName(updatedCharacter.getName());
        character.setLevel(updatedCharacter.getLevel());
        return characterRepository.save(character);
    }

    @DeleteMapping("/{id}")
    public void deleteCharacter(@PathVariable Long id) {
        characterRepository.deleteById(id);
    }
}
