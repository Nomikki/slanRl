import { WearableType } from "@/items/pickable";
import Actor from "@/units/actor";
import { ensure } from "@/utils";

export default class Equipments {
  items: Actor[];

  constructor() {
    this.items = [];
  }

  add(actor: Actor): boolean {
    this.items.push(actor);

    return true;
  }

  takeOff(type: WearableType): Actor | undefined {
    for (let i = 0; i < this.items.length; i++) {
      if (
        this.items[i].pickable?.effect &&
        this.items[i].pickable?.effect.type === type
      ) {
        const temp = this.items.splice(i, 1);
        return temp[0];
      }
    }

    return undefined;
  }

  thisTypeIsWeared(type: WearableType): Actor | undefined {
    for (let i = 0; i < this.items.length; i++) {
      if (
        this.items[i].pickable?.effect &&
        this.items[i].pickable?.effect.type === type
      ) {
        return this.items[i];
      }
    }

    return undefined;
  }

  getRangeWeapon(): Actor | undefined {
    for (let i = 0; i < this.items.length; i++) {
      if (
        this.items[i].pickable?.effect &&
        this.items[i].pickable?.effect.type === WearableType.RANGED_WEAPON
      ) {
        return this.items[i];
      }
    }

    return undefined;
  }

  getAC(): number {
    let ac = 0;
    for (const item of this.items) {
      if (item.armor) {
        ac += item.armor.armorClass;
      }
    }
    return ac;
  }

  getMeleePower(): string {
    let dmg = "1d3";
    for (const item of this.items) {
      if (
        item.weapon &&
        item.pickable &&
        (item.pickable.effect.type === WearableType.ONEHANDED_WEAPON ||
          item.pickable.effect.type === WearableType.TWOHANDED_WEAPON)
      ) {
        dmg = item.weapon.damage;
      }
    }
    return dmg;
  }

  getRangePower(): string {
    let dmg = "1d3";
    for (const item of this.items) {
      if (
        item.weapon &&
        item.pickable &&
        item.pickable.effect.type === WearableType.RANGED_WEAPON
      ) {
        dmg = item.weapon.damage;
      }
    }
    return dmg;
  }

  update(owner: Actor) {
    if (owner.destructible) {
      ensure(owner?.destructible).defense = this.getAC();
      ensure(owner.attacker).power_melee = this.getMeleePower();
      ensure(owner.attacker).power_range = this.getRangePower();
      ensure(owner.attacker).rangeAttack_range = ensure(
        this.getRangeWeapon()?.weapon?.rangeMax,
      );
    }
  }
}
