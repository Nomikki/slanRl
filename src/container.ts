import { game } from ".";
import Actor from "./actor";
import { ArmorType } from "./armor";
import { Colors } from "./colors";
import { SelectorType, WearableType } from "./pickable";
import { ensure } from "./utils";
import { DamageType } from "./weapon";

interface MenuBackgroundProps {
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

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

  renderMenuBackground({ title, x, y, w, h }: MenuBackgroundProps) {
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        if ((yy === 0 || yy === h - 1) && xx > 0 && xx < w - 1)
          game.drawChar("-", xx + x, yy + y, Colors.MENU_BORDER);
        else if ((xx === 0 || xx === w - 1) && yy > 0 && yy < h - 1)
          game.drawChar("|", xx + x, yy + y, Colors.MENU_BORDER);
        else if (yy === 0 || xx === 0 || yy === h - 1 || xx === w - 1)
          game.drawChar("+", xx + x, yy + y, Colors.MENU_BORDER);
        else game.drawChar(" ", xx + x, yy + y, Colors.MENU_BORDER);
      }
    }

    //game.drawText(" INVENTORY ", 34, 0);
    for (let i = 0; i < title.length; i++) {
      game.drawChar(
        title.charAt(i),
        x + w / 2 - title.length / 2 + i,
        y,
        Colors.DEFAULT_TEXT,
      );
    }
  }

  render() {
    this.renderMenuBackground({
      title: "INVENTORY",
      x: 15,
      y: 4,
      w: 45,
      h: 30,
    });

    let shortcut = "a";
    let i = 0;
    const menuStartY = 6;
    for (const it of this.inventory) {
      game.drawText(shortcut + ") " + it.name, 16, menuStartY + i);
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

      game.drawText(`${propertiesText}`, 30, menuStartY + i);

      i++;
    }
  }
}
