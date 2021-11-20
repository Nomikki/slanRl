export interface KeyBindings {
  [name: string]: {
    keys: string[];
    description: string;
    showInHelp: boolean;
    phases: string[];
  };
}

export const keyBindings: KeyBindings = {
  MOVE_UP: {
    keys: ["ArrowUp", "w"],
    description: "Move up",
    showInHelp: false,
    phases: ["all"],
  },
  MOVE_UP_RIGHT: {
    keys: ["e"],
    description: "Move up right",
    showInHelp: false,
    phases: ["all"],
  },
  MOVE_RIGHT: {
    keys: ["ArrowRight", "d"],
    description: "Move right",
    showInHelp: false,
    phases: ["all"],
  },
  MOVE_DOWN_RIGHT: {
    keys: ["c"],
    description: "Move down right",
    showInHelp: false,
    phases: ["all"],
  },
  MOVE_DOWN: {
    keys: ["ArrowDown", "s"],
    description: "Move down",
    showInHelp: false,
    phases: ["all"],
  },
  MOVE_DOWN_LEFT: {
    keys: ["z"],
    description: "Move down left",
    showInHelp: false,
    phases: ["all"],
  },
  MOVE_LEFT: {
    keys: ["ArrowLeft", "a"],
    description: "Move left",
    showInHelp: false,
    phases: ["all"],
  },
  MOVE_UP_LEFT: {
    keys: ["q"],
    description: "Move up left",
    showInHelp: false,
    phases: ["all"],
  },

  AIM: {
    keys: ["A"],
    description: "Aim",
    showInHelp: true,
    phases: ["game"],
  },
  SPELL: {
    keys: ["r"],
    description: "Spell",
    showInHelp: true,
    phases: ["game"],
  },
  PICK: {
    keys: ["g"],
    description: "Pick up an item",
    showInHelp: true,
    phases: ["game"],
  },
  INVENTORY: {
    keys: ["i"],
    description: "Use item",
    showInHelp: true,
    phases: ["game"],
  },
  DROP: {
    keys: ["D"],
    description: "Drop item from inventory",
    showInHelp: true,
    phases: ["game"],
  },
  GO_DOWN: {
    keys: [">"],
    description: "Go Down",
    showInHelp: true,
    phases: ["game"],
  },
  OPEN_DOORS: {
    keys: ["o"],
    description: "Open or close door close to you",
    showInHelp: true,
    phases: ["game"],
  },
  OPEN_DOOR: {
    keys: ["O"],
    description: "Open or close door in one direction",
    showInHelp: true,
    phases: ["game"],
  },
  WEAR_EQUIP: {
    keys: ["W"],
    description: "Wear/equip",
    showInHelp: true,
    phases: ["game"],
  },
  PUSH: {
    keys: ["p"],
    description: "Push",
    showInHelp: true,
    phases: ["game"],
  },
  PULL: {
    keys: ["P"],
    description: "Pull",
    showInHelp: true,
    phases: ["game"],
  },
  REST: {
    keys: [".", "x"],
    description: "Rest / skip turn",
    showInHelp: true,
    phases: ["game"],
  },

  ESCAPE: {
    keys: ["Escape"],
    description: "Escape",
    showInHelp: false,
    phases: ["all"],
  },
  SELECT: {
    keys: ["Enter"],
    description: "Select",
    showInHelp: false,
    phases: ["menu"],
  },
  BACK: {
    keys: ["Backspace"],
    description: "Back",
    showInHelp: false,
    phases: ["menu"],
  },
  ZOOM_IN: {
    keys: ["Enter"],
    description: "Zoom in",
    showInHelp: false,
    phases: ["game"],
  },
  ZOOM_OUT: {
    keys: ["-"],
    description: "Zoom out",
    showInHelp: false,
    phases: ["game"],
  },
};

export const keyPress = (phase: string, pressedKey: string) => {
  const binding = Object.values(keyBindings)
    .filter(({ phases }) => phases.includes(phase) || phases.includes("all"))
    .find(({ keys }) => keys.includes(pressedKey));
  const keyOf = Object.keys(keyBindings).find(
    key => keyBindings[key] === binding,
  );

  console.log("keyOf", keyOf, "pressedKey", pressedKey);

  return keyOf || pressedKey;
};

export const keyBindingsForHelp = () =>
  Object.values(keyBindings).filter(({ showInHelp }) => !!showInHelp);
