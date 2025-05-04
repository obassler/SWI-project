package org.swi_project.services;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.swi_project.models.Location;
import org.swi_project.models.Monster;
import org.swi_project.models.NPC;
import org.swi_project.repositories.LocationRepository;
import org.swi_project.repositories.MonsterRepository;
import org.swi_project.repositories.NPCRepository;

@Service
public class LocationService {
    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private MonsterRepository monsterRepository;

    @Autowired
    private NPCRepository npcRepository;

    public Location addMonsterToLocation(int locationId, int monsterId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new EntityNotFoundException("Location not found"));
        Monster monster = monsterRepository.findById(monsterId)
                .orElseThrow(() -> new EntityNotFoundException("Monster not found"));

        if (!location.getMonsters().contains(monster)) {
            location.getMonsters().add(monster);
            monster.getLocations().add(location);
            locationRepository.save(location);
            monsterRepository.save(monster);
        }
        return location;
    }

    public Location removeMonsterFromLocation(int locationId, int monsterId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new EntityNotFoundException("Location not found"));
        Monster monster = monsterRepository.findById(monsterId)
                .orElseThrow(() -> new EntityNotFoundException("Monster not found"));

        location.getMonsters().remove(monster);
        monster.getLocations().remove(location);
        locationRepository.save(location);
        monsterRepository.save(monster);

        return location;
    }

    public Location addNpcToLocation(int locationId, int npcId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new EntityNotFoundException("Location not found"));
        NPC npc = npcRepository.findById(npcId)
                .orElseThrow(() -> new EntityNotFoundException("NPC not found"));

        if (!location.getNpcs().contains(npc)) {
            location.getNpcs().add(npc);
            npc.getLocations().add(location);
            locationRepository.save(location);
            npcRepository.save(npc);
        }
        return location;
    }

    public Location removeNpcFromLocation(int locationId, int npcId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new EntityNotFoundException("Location not found"));
        NPC npc = npcRepository.findById(npcId)
                .orElseThrow(() -> new EntityNotFoundException("NPC not found"));

        location.getNpcs().remove(npc);
        npc.getLocations().remove(location);
        locationRepository.save(location);
        npcRepository.save(npc);

        return location;
    }
}
