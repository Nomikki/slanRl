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
    this.items = [];
  }

  clear() {
    if (this.items && this.items.length > 0) this.items = [];
  }

  addItem(code: MenuItemCode, label: string) {
    const item = new MenuItem();
    item.code = code;
    item.label = label;
    this.items.push(item);
  }
}
