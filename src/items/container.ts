import { game } from "@/index";
import { SelectorType, WearableType } from "@/items/pickable";
import { ArmorType } from "@/rpg/armor";
import { DamageType } from "@/rpg/weapon";
import Actor from "@/units/actor";
import { capitalize, ensure } from "@/utils";

export default class Container {
  size: number;
  inventory: Actor[];

  constructor(size: number) {
    this.size = size; //maximum number of actors
    this.inventory = [];
  }

  add(actor: Actor): boolean {
    if (this.size > 0 && this.inventory.length >= this.size) {
      //inventory is full
      return false;
    } else {
      this.inventory.push(actor);
      return true;
    }
  }

  remove(actor: Actor) {
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i] === actor) {
        this.inventory.splice(i, 1);
        return;
      }
    }
  }

  render(title: string) {
    game.renderMenuBackground({
      title: title,
      x: 15,
      y: 4,
      w: 45,
      h: 30,
    });

    let shortcut = "a";
    let i = 0;
    const menuStartY = 6;
    for (const it of this.inventory) {
      game.drawText(`${shortcut} ) ${capitalize(it.name)}`, 16, menuStartY + i);
      const weight = ensure(it.pickable).weight;
      game.drawText(`${weight} lb`, 54, menuStartY + i);
      shortcut = String.fromCharCode(shortcut.charCodeAt(0) + 1);

      let propertiesText = "";
      if (it.armor) {
        if (it.armor.armorType === ArmorType.SHIELD)
          propertiesText = `AC: ${it.armor.armorClass}, shield`;
        if (it.armor.armorType === ArmorType.LIGHT_ARMOR)
          propertiesText = `AC: ${it.armor.armorClass}, light armor`;
        if (it.armor.armorType === ArmorType.MEDIUM_ARMOR)
          propertiesText = `AC: ${it.armor.armorClass}, medium armor`;
        if (it.armor.armorType === ArmorType.HEAVY_ARMOR)
          propertiesText = `AC: ${it.armor.armorClass}, heavy armor`;
      }

      if (it.weapon) {
        if (it.weapon.damageType === DamageType.BLUDGEONING)
          propertiesText = `damage: ${it.weapon.damage}, bludgeoning`;
        if (it.weapon.damageType === DamageType.PIERCING)
          propertiesText = `damage: ${it.weapon.damage}, piercing`;
        if (it.weapon.damageType === DamageType.SLASHING)
          propertiesText = `damage: ${it.weapon.damage}, slashing`;
      }

      if (it.pickable?.effect) {
        let effectText = "";

        if (it.pickable.effectName === "HealthEffect") {
          if (it.pickable.effect.amount > 0) {
            effectText = `healing: ${Math.abs(it.pickable.effect.amount)}`;
          } else {
            effectText = `damage: ${Math.abs(it.pickable.effect.amount)}`;
          }
        }
        if (it.pickable.effectName === "AiChangeEffect") {
          effectText = `confused ${it.pickable.effect.newAi.nbTurns} turns`;
        }

        if (it.name === "scroll of map") {
          effectText = "Reveal current map";
        }

        propertiesText += `${effectText}`;

        if (it.pickable?.selector) {
          propertiesText += ", ";
        }
      }

      if (it.pickable?.selector) {
        let selectorText = "";
        const range = it.pickable.selector.range;

        if (it.pickable.selector.type === SelectorType.CLOSEST_MONSTER)
          selectorText = "closest enemy";
        if (it.pickable.selector.type === SelectorType.SELECTED_MONSTER)
          selectorText = "selected monster";
        if (it.pickable.selector.type === SelectorType.SELECTED_RANGE)
          selectorText = "selected range";
        if (it.pickable.selector.type === SelectorType.WEARER_RANGE)
          selectorText = "wearer range";

        propertiesText += `${selectorText}, range: ${range}`;
      }

      if (it.pickable?.effect && it.pickable.effectName === "Wearable") {
        if (it.pickable.effect.type === WearableType.ONEHANDED_WEAPON)
          propertiesText += ", one-handed";
        if (it.pickable.effect.type === WearableType.TWOHANDED_WEAPON)
          propertiesText += ", two-handed";
        if (it.pickable.effect.type === WearableType.SHIELD)
          propertiesText += ", shield";
        if (it.pickable.effect.type === WearableType.ARMOR)
          propertiesText += ", armor";
      }

      game.drawText(`${capitalize(propertiesText)}`, 30, menuStartY + i);

      i++;
    }
  }
}
