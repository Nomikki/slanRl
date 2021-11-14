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
  cursor: number;

  constructor() {
    this.items = [];
    this.cursor = 0;
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
