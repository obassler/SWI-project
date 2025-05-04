package org.swi_project.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;

import org.swi_project.models.Quest;
import org.swi_project.models.Character;
import org.swi_project.repositories.QuestRepository;
import org.swi_project.repositories.CharacterRepository;

@RestController
@RequestMapping("/api/quests")
public class QuestController {

    private final QuestRepository questRepository;
    private final CharacterRepository characterRepository;

    @Autowired
    public QuestController(QuestRepository questRepository, CharacterRepository characterRepository) {
        this.questRepository = questRepository;
        this.characterRepository = characterRepository;
    }

    @GetMapping
    public List<Quest> getAllQuests() {
        return questRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quest> getQuestById(@PathVariable int id) {
        Optional<Quest> quest = questRepository.findById(id);
        return quest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Quest createQuest(@RequestBody Quest quest) {
        return questRepository.save(quest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quest> updateQuest(@PathVariable int id, @RequestBody Quest questDetails) {
        Optional<Quest> quest = questRepository.findById(id);
        if (quest.isPresent()) {
            Quest existingQuest = quest.get();
            existingQuest.setTitle(questDetails.getTitle());
            existingQuest.setDescription(questDetails.getDescription());
            existingQuest.setCompletion(questDetails.isCompletion());
            return ResponseEntity.ok(questRepository.save(existingQuest));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuest(@PathVariable int id) {
        Optional<Quest> quest = questRepository.findById(id);
        if (quest.isPresent()) {
            questRepository.delete(quest.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/{questId}/participants")
    public ResponseEntity<List<Character>> getQuestParticipants(@PathVariable int questId) {
        Optional<Quest> quest = questRepository.findById(questId);
        return quest.map(q -> ResponseEntity.ok(q.getParticipants()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{questId}/participants/{characterId}")
    public ResponseEntity<Quest> addParticipantToQuest(
            @PathVariable int questId,
            @PathVariable int characterId) {
        Optional<Quest> questOpt = questRepository.findById(questId);
        Optional<Character> characterOpt = characterRepository.findById(characterId);

        if (questOpt.isPresent() && characterOpt.isPresent()) {
            Quest quest = questOpt.get();
            Character character = characterOpt.get();

            if (!quest.getParticipants().contains(character)) {
                quest.getParticipants().add(character);
                return ResponseEntity.ok(questRepository.save(quest));
            }
            return ResponseEntity.ok(quest);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{questId}/participants/{characterId}")
    public ResponseEntity<Quest> removeParticipantFromQuest(
            @PathVariable int questId,
            @PathVariable int characterId) {
        Optional<Quest> questOpt = questRepository.findById(questId);
        Optional<Character> characterOpt = characterRepository.findById(characterId);

        if (questOpt.isPresent() && characterOpt.isPresent()) {
            Quest quest = questOpt.get();
            Character character = characterOpt.get();

            if (quest.getParticipants().remove(character)) {
                return ResponseEntity.ok(questRepository.save(quest));
            }
            return ResponseEntity.ok(quest);
        }
        return ResponseEntity.notFound().build();
    }
    @PutMapping("/{questId}/complete")
    public ResponseEntity<Quest> completeQuest(@PathVariable int questId) {
        Optional<Quest> questOpt = questRepository.findById(questId);
        if (questOpt.isPresent()) {
            Quest quest = questOpt.get();
            quest.setCompletion(true);
            return ResponseEntity.ok(questRepository.save(quest));
        }
        return ResponseEntity.notFound().build();
    }
}