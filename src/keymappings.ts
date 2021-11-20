export interface KeyBindings {
  [name: string]: {
    keys: string[];
    description: string;
    showInHelp: boolean;
  };
}

export const keyBindings: KeyBindings = {
  MOVE_UP: {
    keys: ["ArrowUp", "w"],
    description: "Move up",
    showInHelp: false,
  },
  MOVE_UP_RIGHT: {
    keys: ["e"],
    description: "Move up right",
    showInHelp: false,
  },
  MOVE_RIGHT: {
    keys: ["ArrowRight", "d"],
    description: "Move right",
    showInHelp: false,
  },
  MOVE_DOWN_RIGHT: {
    keys: ["c"],
    description: "Move down right",
    showInHelp: false,
  },
  MOVE_DOWN: {
    keys: ["ArrowDown", "s"],
    description: "Move down",
    showInHelp: false,
  },
  MOVE_DOWN_LEFT: {
    keys: ["z"],
    description: "Move down left",
    showInHelp: false,
  },
  MOVE_LEFT: {
    keys: ["ArrowLeft", "a"],
    description: "Move left",
    showInHelp: false,
  },
  MOVE_UP_LEFT: {
    keys: ["q"],
    description: "Move up left",
    showInHelp: false,
  },
  AIM: {
    keys: ["A"],
    description: "Aim",
    showInHelp: true,
  },
  SPELL: {
    keys: ["r"],
    description: "Spell",
    showInHelp: true,
  },
  PICK: {
    keys: ["g"],
    description: "Pick up an item",
    showInHelp: true,
  },
  INVENTORY: {
    keys: ["i"],
    description: "Use item",
    showInHelp: true,
  },
  DROP: {
    keys: ["D"],
    description: "Drop item from inventory",
    showInHelp: true,
  },
  GO_DOWN: {
    keys: [">"],
    description: "Go Down",
    showInHelp: true,
  },
  OPEN_DOORS: {
    keys: ["o"],
    description: "Open or close door close to you",
    showInHelp: true,
  },
  OPEN_DOOR: {
    keys: ["O"],
    description: "Open or close door in one direction",
    showInHelp: true,
  },
  WEAR_EQUIP: {
    keys: ["W"],
    description: "Wear/equip",
    showInHelp: true,
  },
  PUSH: {
    keys: ["p"],
    description: "Push",
    showInHelp: true,
  },
  PULL: {
    keys: ["P"],
    description: "Pull",
    showInHelp: true,
  },
  REST: {
    keys: [".", "x"],
    description: "Rest / skip turn",
    showInHelp: true,
  },
};

export const keyPress = (pressedKey: string) => {
  const binding = Object.values(keyBindings).find(({ keys }) =>
    keys.includes(pressedKey),
  );
  const keyOf = Object.keys(keyBindings).find(
    key => keyBindings[key] === binding,
  );

  return keyOf || pressedKey;
};

export const keyBindingsForHelp = () =>
  Object.values(keyBindings).filter(({ showInHelp }) => !!showInHelp);
