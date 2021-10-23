import { DeepReadonly } from './utils';

const constants = {
  NONE: 0,
  NEW_GAME: 1,
  CONTINUE: 2,
  EXIT: 3,
  CONSTITUTION: 4,
  STRENGTH: 5,
  AGILITY: 6,
};

export class MenuItem {
  code: number;
  label: string;

  constructor() {
    this.code = 0;
    this.label = '';
  }
}

export class Menu {
  constants: DeepReadonly<typeof constants> = constants;
  items: MenuItem[] = [];

  clear() {
    if (this.items && this.items.length > 0) {
      this.items = [];
    }
  }

  addItem(code: number, label: string) {
    const item = new MenuItem();
    item.code = code;
    item.label = label;
    this.items.push(item);
  }
}
