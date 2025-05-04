package org.swi_project.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;

import org.swi_project.models.Item;
import org.swi_project.models.Character;
import org.swi_project.repositories.ItemRepository;
import org.swi_project.repositories.CharacterRepository;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository itemRepository;
    private final CharacterRepository characterRepository;

    @Autowired
    public ItemController(ItemRepository itemRepository, CharacterRepository characterRepository) {
        this.itemRepository = itemRepository;
        this.characterRepository = characterRepository;
    }

    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable int id) {
        Optional<Item> item = itemRepository.findById(id);
        return item.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item createItem(@RequestBody Item item) {
        return itemRepository.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable int id, @RequestBody Item itemDetails) {
        Optional<Item> item = itemRepository.findById(id);
        if (item.isPresent()) {
            Item existingItem = item.get();
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

            return ResponseEntity.ok(itemRepository.save(existingItem));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable int id) {
        Optional<Item> item = itemRepository.findById(id);
        if (item.isPresent()) {
            itemRepository.delete(item.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Character inventory endpoints
    @GetMapping("/character/{characterId}/inventory")
    public ResponseEntity<List<Item>> getCharacterInventory(@PathVariable int characterId) {
        return characterRepository.findById(characterId)
                .map(character -> ResponseEntity.ok(itemRepository.findByOwner(character)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/character/{characterId}/add")
    public ResponseEntity<Item> addItemToCharacter(@PathVariable int characterId, @RequestBody Item item) {
        Optional<Character> character = characterRepository.findById(characterId);
        if (character.isPresent()) {
            item.setOwner(character.get());
            return ResponseEntity.status(HttpStatus.CREATED).body(itemRepository.save(item));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{itemId}/equip")
    public ResponseEntity<Item> equipItem(@PathVariable int itemId) {
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isPresent()) {
            Item item = itemOpt.get();
            item.equip();
            return ResponseEntity.ok(itemRepository.save(item));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{itemId}/unequip")
    public ResponseEntity<Item> unequipItem(@PathVariable int itemId) {
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isPresent()) {
            Item item = itemOpt.get();
            item.unequip();
            return ResponseEntity.ok(itemRepository.save(item));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}