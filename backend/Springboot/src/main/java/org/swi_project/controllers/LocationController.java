package org.swi_project.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private MonsterRepository monsterRepository;

    @Autowired
    private NPCRepository npcRepository;

    @GetMapping
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable int id) {
        Optional<Location> location = locationRepository.findById(id);
        return location.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable int id, @RequestBody Location updatedLocation) {
        Optional<Location> optionalLocation = locationRepository.findById(id);
        if (optionalLocation.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Location existing = optionalLocation.get();
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
        return ResponseEntity.ok(saved);
    }
}
