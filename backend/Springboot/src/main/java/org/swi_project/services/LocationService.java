package org.swi_project.services;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.swi_project.models.*;
import org.swi_project.models.MonsterQuantityDTO;
import org.swi_project.repositories.*;
import org.swi_project.DTO.*;

import java.util.ArrayList;
import java.util.List;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private MonsterRepository monsterRepository;

    @Autowired
    private NPCRepository npcRepository;

    @Autowired
    private MonsterInLocationRepository monsterInLocationRepository;

    public Location updateLocation(int locationId, String name, String description, List<Integer> npcIds, List<MonsterQuantityDTO> monsters) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new EntityNotFoundException("Location not found"));

        location.setName(name);
        location.setDescription(description);

        List<NPC> npcs = npcRepository.findAllById(npcIds);
        location.setNpcs(npcs);

        location.getMonstersInLocation().clear();
        locationRepository.save(location);

        List<MonsterInLocation> updatedList = new ArrayList<>();

        for (MonsterQuantityDTO mq : monsters) {
            Monster monster = monsterRepository.findById(mq.getMonsterId())
                    .orElseThrow(() -> new EntityNotFoundException("Monster not found: " + mq.getMonsterId()));

            MonsterInLocation link = new MonsterInLocation();
            link.setLocation(location);
            link.setMonster(monster);
            link.setQuantity(mq.getQuantity());

            updatedList.add(link);
        }
        monsterInLocationRepository.saveAll(updatedList);
        location.setMonstersInLocation(updatedList);

        return locationRepository.save(location);
    }
}
