export default class Container {
  constructor(size) {
    this.size = size; //maximum number of actors
    this.inventory = new Array();
  }

  add(actor) {
    if (this.size > 0 && this.inventory.length >= this.size) {
      //inventory is full
      return false;
    } else {
      this.inventory.push(actor);
      return true;
    }
  }

  remove(actor) {
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i] === actor) {
        this.inventory.splice(i, 1);
        return;
      }
    }
  }
}
