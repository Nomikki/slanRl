export interface KeyBindings {
  [name: string]: {
    key: string[];
    description: string;
  };
}

export const keyBindings: KeyBindings = {
  MOVE_UP: {
    key: ["ArrowUp", "w"],
    description: "Move up",
  },
  MOVE_UP_RIGHT: {
    key: ["e"],
    description: "Move up right",
  },
  MOVE_RIGHT: {
    key: ["ArrowRight", "d"],
    description: "Move right",
  },
  MOVE_DOWN_RIGHT: {
    key: ["c"],
    description: "Move down right",
  },
  MOVE_DOWN: {
    key: ["ArrowDown", "s"],
    description: "Move down",
  },
  MOVE_DOWN_LEFT: {
    key: ["z"],
    description: "Move down left",
  },
  MOVE_LEFT: {
    key: ["ArrowLeft", "a"],
    description: "Move left",
  },
  MOVE_UP_LEFT: {
    key: ["q"],
    description: "Move up left",
  },
  AIM: {
    key: ["A"],
    description: "Aim",
  },
  SPELL: {
    key: ["r"],
    description: "Spell",
  },
  PICK: {
    key: ["g"],
    description: "Pick up an item",
  },
  INVENTORY: {
    key: ["i"],
    description: "Use item",
  },
  DROP: {
    key: ["D"],
    description: "Drop item from inventory",
  },
  GO_DOWN: {
    key: [">"],
    description: "Go Down",
  },
  OPEN_DOORS: {
    key: ["o"],
    description: "Open or close doors",
  },
  OPEN_DOOR: {
    key: ["O"],
    description: "Open or close door",
  },
  WEAR_EQUIP: {
    key: ["W"],
    description: "Wear/equip",
  },
  PUSH: {
    key: ["p"],
    description: "Push",
  },
  PULL: {
    key: ["P"],
    description: "Pull",
  },
  REST: {
    key: [".", "x"],
    description: "Rest / skip turn",
  },
};

export const keyPress = (pressedKey: string) => {
  const binding = Object.values(keyBindings).find(({ key }) =>
    key.includes(pressedKey),
  );
  const keyOf = Object.keys(keyBindings).find(
    key => keyBindings[key] === binding,
  );

  return keyOf || pressedKey;
};
