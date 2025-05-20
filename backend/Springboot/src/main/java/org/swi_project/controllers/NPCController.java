package org.swi_project.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;

import org.swi_project.models.NPC;
import org.swi_project.repositories.NPCRepository;

@RestController
@RequestMapping("/api/npcs")
public class NPCController {

    private final NPCRepository npcRepository;

    @Autowired
    public NPCController(NPCRepository npcRepository) {
        this.npcRepository = npcRepository;
    }

    @GetMapping
    public List<NPC> getAllNPCs() {
        return npcRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NPC> getNPCById(@PathVariable int id) {
        Optional<NPC> npc = npcRepository.findById(id);
        return npc.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NPC createNPC(@RequestBody NPC npc) {
        return npcRepository.save(npc);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NPC> updateNpc(@PathVariable int id, @RequestBody NPC updatedNpc) {
        return npcRepository.findById(id)
                .map(npc -> {
                    npc.setName(updatedNpc.getName());
                    npc.setRole(updatedNpc.getRole());
                    npc.setDescription(updatedNpc.getDescription());
                    npc.setHostility(updatedNpc.isHostility());
                    return ResponseEntity.ok(npcRepository.save(npc));
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNPC(@PathVariable int id) {
        Optional<NPC> npc = npcRepository.findById(id);
        if (npc.isPresent()) {
            npcRepository.delete(npc.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}