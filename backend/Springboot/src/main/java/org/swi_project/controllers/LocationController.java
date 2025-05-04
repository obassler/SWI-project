package org.swi_project.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;

import org.swi_project.models.Location;
import org.swi_project.repositories.LocationRepository;
import org.swi_project.services.LocationService;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @PostMapping("/{locationId}/monsters/{monsterId}")
    public ResponseEntity<Location> addMonsterToLocation(@PathVariable int locationId, @PathVariable int monsterId) {
        Location updatedLocation = locationService.addMonsterToLocation(locationId, monsterId);
        return ResponseEntity.ok(updatedLocation);
    }

    @DeleteMapping("/{locationId}/monsters/{monsterId}")
    public ResponseEntity<Location> removeMonsterFromLocation(@PathVariable int locationId, @PathVariable int monsterId) {
        Location updatedLocation = locationService.removeMonsterFromLocation(locationId, monsterId);
        return ResponseEntity.ok(updatedLocation);
    }

    @PostMapping("/{locationId}/npcs/{npcId}")
    public ResponseEntity<Location> addNpcToLocation(@PathVariable int locationId, @PathVariable int npcId) {
        Location updatedLocation = locationService.addNpcToLocation(locationId, npcId);
        return ResponseEntity.ok(updatedLocation);
    }

    @DeleteMapping("/{locationId}/npcs/{npcId}")
    public ResponseEntity<Location> removeNpcFromLocation(@PathVariable int locationId, @PathVariable int npcId) {
        Location updatedLocation = locationService.removeNpcFromLocation(locationId, npcId);
        return ResponseEntity.ok(updatedLocation);
    }
}
