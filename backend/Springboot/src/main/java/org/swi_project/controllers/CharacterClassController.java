package org.swi_project.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.swi_project.models.CharacterClass;
import org.swi_project.repositories.CharacterClassRepository;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class CharacterClassController {

    private final CharacterClassRepository characterClassRepository;

    @GetMapping
    public List<CharacterClass> getAllClasses() {
        return characterClassRepository.findAll();
    }
}
