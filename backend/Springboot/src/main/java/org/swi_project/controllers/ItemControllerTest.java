package org.swi_project.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.swi_project.models.Item;
import org.swi_project.models.Character;
import org.swi_project.repositories.ItemRepository;
import org.swi_project.repositories.CharacterRepository;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ItemControllerUnitTest {

    @InjectMocks
    private ItemController itemController;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private CharacterRepository characterRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetItemByIdFound() {
        Item item = new Item();
        item.setId(1);
        item.setName("Sword");

        when(itemRepository.findById(1)).thenReturn(Optional.of(item));

        ResponseEntity<Item> response = itemController.getItemById(1);

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(item);
        verify(itemRepository).findById(1);
    }

    @Test
    void testGetItemByIdNotFound() {
        when(itemRepository.findById(1)).thenReturn(Optional.empty());

        ResponseEntity<Item> response = itemController.getItemById(1);

        assertThat(response.getStatusCodeValue()).isEqualTo(404);
        assertThat(response.getBody()).isNull();
        verify(itemRepository).findById(1);
    }

    @Test
    void testCreateItem() {
        Item item = new Item();
        item.setName("Shield");

        when(itemRepository.save(item)).thenReturn(item);

        Item saved = itemController.createItem(item);

        assertThat(saved).isEqualTo(item);
        verify(itemRepository).save(item);
    }

    @Test
    void testDeleteItemFound() {
        Item item = new Item();
        item.setId(1);

        when(itemRepository.findById(1)).thenReturn(Optional.of(item));
        doNothing().when(itemRepository).delete(item);

        ResponseEntity<Void> response = itemController.deleteItem(1);

        assertThat(response.getStatusCodeValue()).isEqualTo(204);
        verify(itemRepository).findById(1);
        verify(itemRepository).delete(item);
    }

    @Test
    void testDeleteItemNotFound() {
        when(itemRepository.findById(1)).thenReturn(Optional.empty());

        ResponseEntity<Void> response = itemController.deleteItem(1);

        assertThat(response.getStatusCodeValue()).isEqualTo(404);
        verify(itemRepository).findById(1);
        verify(itemRepository, never()).delete(any());
    }

    @Test
    void testAddItemToCharacterExceedWeapons() {
        Character character = new Character();
        character.setId(1);
        Item weapon1 = new Item();
        weapon1.setType("WEAPON");
        Item weapon2 = new Item();
        weapon2.setType("WEAPON");
        character.setItems(Arrays.asList(weapon1, weapon2));

        when(characterRepository.findById(1)).thenReturn(Optional.of(character));

        Item newWeapon = new Item();
        newWeapon.setType("WEAPON");

        ResponseEntity<?> response = itemController.addItemToCharacter(1, newWeapon);

        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo("Character can't carry more than 2 weapons.");
    }

    @Test
    void testAddItemToCharacterSuccess() {
        Character character = new Character();
        character.setId(1);
        character.setItems(Collections.emptyList());

        when(characterRepository.findById(1)).thenReturn(Optional.of(character));
        Item newItem = new Item();
        newItem.setType("WEAPON");
        newItem.setOwner(null);

        when(itemRepository.save(any(Item.class))).thenAnswer(i -> i.getArgument(0));

        ResponseEntity<?> response = itemController.addItemToCharacter(1, newItem);

        assertThat(response.getStatusCodeValue()).isEqualTo(201);
        assertThat(((Item)response.getBody()).getOwner()).isEqualTo(character);
        verify(itemRepository).save(any(Item.class));
    }
}
