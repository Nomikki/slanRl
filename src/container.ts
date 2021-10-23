import Actor from './actor';

export type Size = number;

export default class Container {
  inventory: Actor[];
  size: Size;

  constructor(size: Size) {
    this.size = size; //maximum number of actors
    this.inventory = [];
  }

  add(actor: Actor) {
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
}
