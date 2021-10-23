"use strict";

export class MenuItem {
  code: number;
  label: string;

  constructor() {
    this.code = 0;
    this.label = "";
  }
}

export enum MenuItemCode {
  NONE,
  NEW_GAME,
  CONTINUE,
  EXIT,
  CONSTITUTION,
  STRENGTH,
  AGILITY,
}

export class Menu {
  items: MenuItem[];

  constructor() {
    this.items = new Array();
  }

  clear() {
    if (this.items && this.items.length > 0) this.items = new Array();
  }

  addItem(code: MenuItemCode, label: string) {
    let item = new MenuItem();
    item.code = code;
    item.label = label;
    this.items.push(item);
  }
}
