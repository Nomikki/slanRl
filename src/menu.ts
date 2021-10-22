"use strict";

export class MenuItem {
  code: number;
  label: string;

  constructor() {
    this.code = 0;
    this.label = "";
  }
}

export class Menu {
  constants: any;
  items: any;
  constructor() {
    this.constants = Object.freeze({
      NONE: 0,
      NEW_GAME: 1,
      CONTINUE: 2,
      EXIT: 3,
      CONSTITUTION: 4,
      STRENGTH: 5,
      AGILITY: 6,
    });

    this.items = new Array();
  }

  clear() {
    if (this.items && this.items.length > 0) this.items = null;
  }

  addItem(code: number, label: string) {
    let item = new MenuItem();
    item.code = code;
    item.label = label;
    this.items.push(item);
  }
}
