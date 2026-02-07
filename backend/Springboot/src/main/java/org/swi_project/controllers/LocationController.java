package org.swi_project.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.swi_project.exception.ResourceNotFoundException;
import org.swi_project.models.Location;
import org.swi_project.models.Monster;
import org.swi_project.models.MonsterInLocation;
import org.swi_project.models.NPC;
import org.swi_project.repositories.LocationRepository;
import org.swi_project.repositories.MonsterRepository;
import org.swi_project.repositories.NPCRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Slf4j
public class LocationController {

    private final LocationRepository locationRepository;
    private final MonsterRepository monsterRepository;
    private final NPCRepository npcRepository;

    @GetMapping
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable int id) {
        return locationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));
    }

    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        Location saved = locationRepository.save(location);
        log.info("Created location: {}", saved.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Location> updateLocation(@PathVariable int id, @RequestBody Location updatedLocation) {
        Location existing = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));

        existing.setName(updatedLocation.getName());
        existing.setDescription(updatedLocation.getDescription());

        List<NPC> attachedNpcs = new ArrayList<>();
        if (updatedLocation.getNpcs() != null && !updatedLocation.getNpcs().isEmpty()) {
            for (NPC npc : updatedLocation.getNpcs()) {
                if (npc.getId() != null) {
                    Optional<NPC> found = npcRepository.findById(npc.getId());
                    found.ifPresent(attachedNpcs::add);
                }
            }
        }

        for (NPC npc : existing.getNpcs()) {
            npc.setLocation(null);
        }
        existing.getNpcs().clear();

        for (NPC npc : attachedNpcs) {
            npc.setLocation(existing);
        }
        existing.getNpcs().addAll(attachedNpcs);

        existing.getMonstersInLocation().clear();
        List<MonsterInLocation> newLinks = new ArrayList<>();
        if (updatedLocation.getMonstersInLocation() != null) {
            for (MonsterInLocation mil : updatedLocation.getMonstersInLocation()) {
                if (mil.getMonster() != null && mil.getMonster().getId() != null) {
                    Optional<Monster> optMonster = monsterRepository.findById(mil.getMonster().getId());
                    if (optMonster.isPresent()) {
                        MonsterInLocation link = new MonsterInLocation();
                        link.setLocation(existing);
                        link.setMonster(optMonster.get());
                        link.setQuantity(mil.getQuantity());
                        newLinks.add(link);
                    }
                }
            }
        }
        existing.getMonstersInLocation().addAll(newLinks);

        Location saved = locationRepository.save(existing);
        log.info("Updated location id={}", id);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable int id) {
        if (!locationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Location", id);
        }
        locationRepository.deleteById(id);
        log.info("Deleted location id={}", id);
        return ResponseEntity.noContent().build();
    }
}
