package org.swi_project.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.swi_project.exception.ResourceNotFoundException;
import org.swi_project.models.Item;
import org.swi_project.repositories.ItemRepository;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ItemControllerUnitTest {

    @InjectMocks
    private ItemController itemController;

    @Mock
    private ItemRepository itemRepository;

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

        assertThatThrownBy(() -> itemController.getItemById(1))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(itemRepository).findById(1);
    }

    @Test
    void testCreateItem() {
        Item item = new Item();
        item.setName("Shield");

        when(itemRepository.save(item)).thenReturn(item);

        ResponseEntity<Item> response = itemController.createItem(item);

        assertThat(response.getStatusCodeValue()).isEqualTo(201);
        assertThat(response.getBody()).isEqualTo(item);
        verify(itemRepository).save(item);
    }

    @Test
    void testDeleteItemFound() {
        when(itemRepository.existsById(1)).thenReturn(true);
        doNothing().when(itemRepository).deleteById(1);

        ResponseEntity<Void> response = itemController.deleteItem(1);

        assertThat(response.getStatusCodeValue()).isEqualTo(204);
        verify(itemRepository).existsById(1);
        verify(itemRepository).deleteById(1);
    }

    @Test
    void testDeleteItemNotFound() {
        when(itemRepository.existsById(1)).thenReturn(false);

        assertThatThrownBy(() -> itemController.deleteItem(1))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(itemRepository).existsById(1);
        verify(itemRepository, never()).deleteById(anyInt());
    }
}
