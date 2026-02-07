package org.swi_project.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.swi_project.exception.ResourceNotFoundException;
import org.swi_project.models.NPC;
import org.swi_project.repositories.NPCRepository;

import java.util.List;

@RestController
@RequestMapping("/api/npcs")
@RequiredArgsConstructor
@Slf4j
public class NPCController {

    private final NPCRepository npcRepository;

    @GetMapping
    public List<NPC> getAllNPCs() {
        return npcRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NPC> getNPCById(@PathVariable int id) {
        return npcRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("NPC", id));
    }

    @PostMapping
    public ResponseEntity<NPC> createNPC(@Valid @RequestBody NPC npc) {
        NPC saved = npcRepository.save(npc);
        log.info("Created NPC: {}", saved.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NPC> updateNpc(@PathVariable int id, @Valid @RequestBody NPC updatedNpc) {
        NPC npc = npcRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NPC", id));

        npc.setName(updatedNpc.getName());
        npc.setRole(updatedNpc.getRole());
        npc.setDescription(updatedNpc.getDescription());
        npc.setHostility(updatedNpc.isHostility());

        log.debug("Updated NPC id={}", id);
        return ResponseEntity.ok(npcRepository.save(npc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNPC(@PathVariable int id) {
        if (!npcRepository.existsById(id)) {
            throw new ResourceNotFoundException("NPC", id);
        }
        npcRepository.deleteById(id);
        log.info("Deleted NPC id={}", id);
        return ResponseEntity.noContent().build();
    }
}
