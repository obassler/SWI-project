package org.swi_project.models;

import jakarta.validation.constraints.*;
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

    @NotBlank
    @Size(min = 1, max = 25)
    @Column(name = "Name", nullable = false, length = 25)
    private String name;

    @NotBlank
    @Size(max = 25)
    @Column(name = "Type", nullable = false, length = 25)
    private String type;

    @Size(max = 200)
    @Column(name = "Description", nullable = false, length = 200)
    private String description;

    @Min(0)
    @Column(name = "Weight", nullable = false)
    private int weight;

    @Min(0)
    @Column(name = "GoldValue", nullable = false)
    private int goldValue;

    @Column(name = "Magic", nullable = false)
    private boolean magic;

    @Size(max = 50)
    @Column(name = "MagicalProperties", nullable = false, length = 50)
    private String magicalProperties;

    @Column(name = "EquipState", nullable = false)
    private boolean equipState;

    @Size(max = 50)
    @Column(name = "DamageType", nullable = false, length = 50)
    private String damageType;

    @Size(max = 50)
    @Column(name = "DamageRoll", nullable = true, length = 50)
    private String damageRoll;

    @Min(0)
    @Column(name = "ArmorClass", nullable = false)
    private int armorClass;

    public boolean isWeapon() {
        return "WEAPON".equalsIgnoreCase(type);
    }

    public boolean isArmor() {
        return "ARMOR".equalsIgnoreCase(type) || "SHIELD".equalsIgnoreCase(type);
    }

    public boolean isEquippable() {
        return isWeapon() || isArmor() ||
                "RING".equalsIgnoreCase(type) ||
                "AMULET".equalsIgnoreCase(type) ||
                "CLOTHING".equalsIgnoreCase(type);
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

}
