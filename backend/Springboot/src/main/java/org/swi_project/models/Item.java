package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "item")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "Name", nullable = false, length = 25)
    private String name;

    @Column(name = "Type", nullable = false, length = 25)
    private String type; // Changed from enum to String to match DB

    @Column(name = "Description", nullable = false, length = 200)
    private String description;

    @Column(name = "Weight", nullable = false)
    private int weight;

    @Column(name = "GoldValue", nullable = false)
    private int goldValue;

    @Column(name = "Magic", nullable = false)
    private boolean magic;

    @Column(name = "MagicalProperties", nullable = false, length = 50)
    private String magicalProperties;

    @Column(name = "EquipState", nullable = false)
    private boolean equipState;

    @Column(name = "DamageType", nullable = false, length = 50)
    private String damageType;

    @Column(name = "DamageRoll", nullable = true, length = 50)
    private String damageRoll;

    @Column(name = "ArmorClass", nullable = false)
    private int armorClass;

    // Helper methods
    public boolean isWeapon() {
        return "WEAPON".equals(type);
    }

    public boolean isArmor() {
        return "ARMOR".equals(type) || "SHIELD".equals(type);
    }

    public boolean isEquippable() {
        return isWeapon() || isArmor() || "RING".equals(type) || "AMULET".equals(type) || "CLOTHING".equals(type);
    }

    public void equip() {
        if (isEquippable()) {
            this.equipState = true;
        }
    }

    public void unequip() {
        this.equipState = false;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(name);

        if (magic) {
            sb.append(" (Magical)");
        }

        if (equipState) {
            sb.append(" [Equipped]");
        }

        return sb.toString();
    }

    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character owner;

    // getters and setters
    public Character getOwner() {
        return owner;
    }

    public void setOwner(Character owner) {
        this.owner = owner;
    }
}