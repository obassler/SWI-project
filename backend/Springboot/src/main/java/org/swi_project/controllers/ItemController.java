package org.swi_project.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.swi_project.exception.ResourceNotFoundException;
import org.swi_project.models.Item;
import org.swi_project.repositories.ItemRepository;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Slf4j
public class ItemController {

    private final ItemRepository itemRepository;

    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable int id) {
        return itemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Item", id));
    }

    @PostMapping
    public ResponseEntity<Item> createItem(@Valid @RequestBody Item item) {
        Item saved = itemRepository.save(item);
        log.info("Created item: {}", saved.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable int id, @Valid @RequestBody Item itemDetails) {
        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", id));

        existingItem.setName(itemDetails.getName());
        existingItem.setDescription(itemDetails.getDescription());
        existingItem.setWeight(itemDetails.getWeight());
        existingItem.setGoldValue(itemDetails.getGoldValue());
        existingItem.setMagic(itemDetails.isMagic());
        existingItem.setMagicalProperties(itemDetails.getMagicalProperties());
        existingItem.setType(itemDetails.getType());
        existingItem.setDamageType(itemDetails.getDamageType());
        existingItem.setDamageRoll(itemDetails.getDamageRoll());
        existingItem.setArmorClass(itemDetails.getArmorClass());

        log.debug("Updated item id={}", id);
        return ResponseEntity.ok(itemRepository.save(existingItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable int id) {
        if (!itemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Item", id);
        }
        itemRepository.deleteById(id);
        log.info("Deleted item id={}", id);
        return ResponseEntity.noContent().build();
    }
}
