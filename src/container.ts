import { ActorTemplate } from "./actor";

export type Size = number;

export default class Container {
  size: Size;
  inventory: ActorTemplate[];

  constructor(size: Size) {
    this.size = size; //maximum number of actors
    this.inventory = new Array();
  }

  add(actor: ActorTemplate) {
    if (this.size > 0 && this.inventory.length >= this.size) {
      //inventory is full
      return false;
    } else {
      this.inventory.push(actor);
      return true;
    }
  }

  remove(actor: ActorTemplate) {
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i] === actor) {
        this.inventory.splice(i, 1);
        return;
      }
    }
  }
}
