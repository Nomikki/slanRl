export class MenuItem {
  code = 0;
  label = "";
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
  items: MenuItem[] = [];

  clear() {
    if (this.items && this.items.length > 0) {
      this.items = [];
    }
  }

  addItem(code: MenuItemCode, label: string) {
    const item = new MenuItem();
    item.code = code;
    item.label = label;
    this.items.push(item);
  }
}
