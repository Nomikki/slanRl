import Actor from "./actor";
import { ConfusedMonsterAi } from "./ai";
import { Colors } from "./colors";
import Pickable, {
  AiChangeEffect,
  HealthEffect,
  MapClearEffect,
  SelectorType,
  TargetSelector,
} from "./pickable";

export const createItem = (name: string, x: number, y: number): Actor => {
  let ch = "?";
  let color = "#F0F";
  let blocks = false;
  let pickable = undefined;

  if (name === "health potion") {
    ch = "!";
    color = Colors.HEALTHPOTION;
    blocks = false;
    pickable = new Pickable(undefined, new HealthEffect(4, undefined));
  } else if (name === "nutella bun") {
    ch = "@";
    color = Colors.HEALTHPOTION;
    blocks = false;
    pickable = new Pickable(undefined, new HealthEffect(30, undefined));
  } else if (name === "scroll of lighting bolt") {
    ch = "#";
    color = Colors.SCROLL_OF_LIGHTING;
    blocks = false;
    pickable = pickable = new Pickable(
      new TargetSelector(SelectorType.CLOSEST_MONSTER, 5),
      new HealthEffect(-20, "A lighting bolt strikes!"),
    );
  } else if (name === "scroll of fireball") {
    ch = "#";
    color = Colors.SCROLL_OF_FIREBALL;
    blocks = false;

    pickable = new Pickable(
      new TargetSelector(SelectorType.SELECTED_RANGE, 3),
      new HealthEffect(-12, "hurdur"),
    );
  } else if (name === "scroll of confusion") {
    ch = "#";
    color = Colors.SCROLL_OF_CONFUSION;
    blocks = false;

    pickable = new Pickable(
      new TargetSelector(SelectorType.SELECTED_MONSTER, 5),
      new AiChangeEffect(new ConfusedMonsterAi(10), "confused af"),
    );
  } else if (name === "scroll of map") {
    ch = "#";
    color = Colors.SCROLL_OF_MAP;
    blocks = false;

    pickable = new Pickable(undefined, new MapClearEffect("All is clear!"));
  } else {
    console.error(`${name} not found.`);
  }

  const item = new Actor(x, y, ch, name, color);

  item.blocks = blocks;
  item.pickable = pickable;

  return item;
};
