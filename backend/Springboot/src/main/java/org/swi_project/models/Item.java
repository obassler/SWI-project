package org.swi_project.models;

import lombok.Getter;
import lombok.Setter;
import javax.persistence.*;

@Getter
@Setter
@Entity
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private ItemType type;
    private String description;
    private int weight;
    private int goldValue;
    private boolean magical;

    @Column(length = 500)
    private String magicalProperties;

    private boolean equipped;

    private String damageType;
    private String damageRoll;

    private int armorClass;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character owner;


    @Enumerated(EnumType.STRING)
    private ItemType itemType;

    public boolean isWeapon() {
        return type == ItemType.WEAPON;
    }

    public boolean isArmor() {
        return type == ItemType.ARMOR || type == ItemType.SHIELD;
    }

    public boolean isEquippable() {
        return isWeapon() || isArmor() || type == ItemType.RING
                || type == ItemType.AMULET || type == ItemType.CLOTHING;
    }
    public void equip() {
        if (isEquippable()) {
            this.equipped = true;
        }
    }

    public void unequip() {
        this.equipped = false;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(name);

        if (magical) {
            sb.append(" (Magical)");
        }

        if (equipped) {
            sb.append(" [Equipped]");
        }

        return sb.toString();
    }
}