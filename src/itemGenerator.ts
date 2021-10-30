import Actor from "./actor";
import { ConfusedMonsterAi } from "./ai";
import Armor, { ArmorType } from "./armor";
import { Colors } from "./colors";
import Pickable, {
  AiChangeEffect,
  HealthEffect,
  MapClearEffect,
  SelectorType,
  TargetSelector,
  Wearable,
  WearableType,
} from "./pickable";

export const createItem = (name: string, x: number, y: number): Actor => {
  let ch = "?";
  let color = "#F0F";
  let blocks = false;

  let pickable = undefined;
  let armor = undefined;

  //armors

  //light armors
  if (name === "leather armor") {
    armor = new Armor(name, 11, "dex", ArmorType.LIGHT_ARMOR, 10);
    ch = "L";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "studded leather") {
    armor = new Armor(name, 12, "dex", ArmorType.LIGHT_ARMOR, 13);
    ch = "L";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "hide") {
    armor = new Armor(name, 12, "dex", ArmorType.MEDIUM_ARMOR, 12);
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "chain shirt") {
    armor = new Armor(name, 13, "dex", ArmorType.MEDIUM_ARMOR, 20);
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "scale mail") {
    armor = new Armor(name, 14, "dex", ArmorType.MEDIUM_ARMOR, 45);
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "breastplate") {
    armor = new Armor(name, 14, "dex", ArmorType.MEDIUM_ARMOR, 20);
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "half plate") {
    armor = new Armor(name, 15, "dex", ArmorType.MEDIUM_ARMOR, 40);
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "ring mail") {
    armor = new Armor(name, 14, "str", ArmorType.HEAVY_ARMOR, 40);
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "chain mail") {
    armor = new Armor(name, 16, "str", ArmorType.HEAVY_ARMOR, 55, 13);
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "splint") {
    armor = new Armor(name, 17, "str", ArmorType.HEAVY_ARMOR, 60, 15);
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "plate") {
    armor = new Armor(name, 18, "str", ArmorType.HEAVY_ARMOR, 65, 15);
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.ARMOR));
  } else if (name === "shield") {
    armor = new Armor(name, 2, "", ArmorType.SHIELD, 6);
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable(undefined, new Wearable(WearableType.SHIELD));
  } else if (name === "health potion") {
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
  item.armor = armor;

  return item;
};
