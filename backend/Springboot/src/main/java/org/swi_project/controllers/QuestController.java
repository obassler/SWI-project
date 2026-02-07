package org.swi_project.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.swi_project.exception.ResourceNotFoundException;
import org.swi_project.models.Character;
import org.swi_project.models.Quest;
import org.swi_project.repositories.CharacterRepository;
import org.swi_project.repositories.QuestRepository;

import java.util.List;

@RestController
@RequestMapping("/api/quests")
@RequiredArgsConstructor
@Slf4j
public class QuestController {

    private final QuestRepository questRepository;
    private final CharacterRepository characterRepository;

    @GetMapping
    public List<Quest> getAllQuests() {
        return questRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quest> getQuestById(@PathVariable int id) {
        return questRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Quest", id));
    }

    @PostMapping
    public ResponseEntity<Quest> createQuest(@Valid @RequestBody Quest quest) {
        Quest saved = questRepository.save(quest);
        log.info("Created quest: {}", saved.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quest> updateQuest(@PathVariable int id, @Valid @RequestBody Quest questDetails) {
        Quest existingQuest = questRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quest", id));

        existingQuest.setTitle(questDetails.getTitle());
        existingQuest.setDescription(questDetails.getDescription());
        existingQuest.setType(questDetails.getType());
        existingQuest.setCompletion(questDetails.isCompletion());

        log.debug("Updated quest id={}", id);
        return ResponseEntity.ok(questRepository.save(existingQuest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuest(@PathVariable int id) {
        if (!questRepository.existsById(id)) {
            throw new ResourceNotFoundException("Quest", id);
        }
        questRepository.deleteById(id);
        log.info("Deleted quest id={}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{questId}/participants")
    public ResponseEntity<List<Character>> getQuestParticipants(@PathVariable int questId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new ResourceNotFoundException("Quest", questId));
        return ResponseEntity.ok(quest.getParticipants());
    }

    @PostMapping("/{questId}/participants/{characterId}")
    public ResponseEntity<Quest> addParticipantToQuest(
            @PathVariable int questId,
            @PathVariable int characterId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new ResourceNotFoundException("Quest", questId));
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("Character", characterId));

        if (!quest.getParticipants().contains(character)) {
            quest.getParticipants().add(character);
            log.info("Added character {} to quest {}", character.getName(), quest.getTitle());
            return ResponseEntity.ok(questRepository.save(quest));
        }
        return ResponseEntity.ok(quest);
    }

    @DeleteMapping("/{questId}/participants/{characterId}")
    public ResponseEntity<Quest> removeParticipantFromQuest(
            @PathVariable int questId,
            @PathVariable int characterId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new ResourceNotFoundException("Quest", questId));
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("Character", characterId));

        if (quest.getParticipants().remove(character)) {
            log.info("Removed character {} from quest {}", character.getName(), quest.getTitle());
            return ResponseEntity.ok(questRepository.save(quest));
        }
        return ResponseEntity.ok(quest);
    }

    @PutMapping("/{questId}/complete")
    public ResponseEntity<Quest> completeQuest(@PathVariable int questId) {
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new ResourceNotFoundException("Quest", questId));
        quest.setCompletion(true);
        log.info("Completed quest: {}", quest.getTitle());
        return ResponseEntity.ok(questRepository.save(quest));
    }
}
