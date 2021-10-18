"use strict";

export class MenuItem {
  constructor() {
    this.code = 0;
    this.label = "";
  }
}

export class Menu {
  constructor() {
    this.constants = Object.freeze({
      NONE: 0,
      NEW_GAME: 1,
      CONTINUE: 2,
      EXIT: 3,
    });

    this.items = new Array();
  }

  clear() {
    if (this.items && this.items.length > 0) this.items = null;
  }

  addItem(code, label) {
    let item = new MenuItem();
    item.code = code;
    item.label = label;
    this.items.push(item);
  }
}
