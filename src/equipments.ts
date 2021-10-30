import Actor from "./actor";
import { WearableType } from "./pickable";
import { ensure } from "./utils";

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

  getAC(): number {
    let ac = 0;
    for (const item of this.items) {
      if (item.armor) {
        ac += item.armor.armorClass;
      }
    }
    return ac;
  }

  update(owner: Actor) {
    if (owner.destructible) {
      ensure(owner?.destructible).defense = this.getAC();
    }
  }
}
