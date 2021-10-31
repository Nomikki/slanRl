import Armor, { ArmorType } from "../rpg/armor";
import Weapon, { DamageType } from "../rpg/weapon";
import Actor from "../units/actor";
import { ConfusedMonsterAi } from "../units/ai";
import { Colors } from "../utils/colors";
import Pickable, {
  AiChangeEffect,
  HealthEffect,
  MapClearEffect,
  SelectorType,
  TargetSelector,
  Wearable,
  WearableType,
} from "./pickable";

export const createItem = (props: {
  name: string;
  x: number;
  y: number;
}): Actor => {
  let ch = "?";
  let color = "#F0F";
  let blocks = false;

  let pickable = undefined;
  let armor = undefined;
  let weapon = undefined;

  //simple melee weapons
  if (props.name === "club") {
    weapon = new Weapon({
      name: props.name,
      damage: "1d4",
      damageType: DamageType.BLUDGEONING,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ONEHANDED_WEAPON),
      weight: 2,
    });
  } else if (props.name === "dagger") {
    weapon = new Weapon({
      name: props.name,
      damage: "1d4",
      damageType: DamageType.PIERCING,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ONEHANDED_WEAPON),
      weight: 1,
    });
  } else if (props.name === "greatclub") {
    weapon = new Weapon({
      name: props.name,
      damage: "1d8",
      damageType: DamageType.BLUDGEONING,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.TWOHANDED_WEAPON),
      weight: 10,
    });
  } else if (props.name === "handaxe") {
    weapon = new Weapon({
      name: props.name,
      damage: "1d6",
      damageType: DamageType.SLASHING,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ONEHANDED_WEAPON),
      weight: 2,
    });
  } else if (props.name === "javelin") {
    weapon = new Weapon({
      name: props.name,
      damage: "1d6",
      damageType: DamageType.PIERCING,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ONEHANDED_WEAPON),
      weight: 2,
    });
  } else if (props.name === "light hammer") {
    weapon = new Weapon({
      name: props.name,
      damage: "1d4",
      damageType: DamageType.BLUDGEONING,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ONEHANDED_WEAPON),
      weight: 2,
    });
  } else if (props.name === "mace") {
    weapon = new Weapon({
      name: props.name,
      damage: "1d6",
      damageType: DamageType.BLUDGEONING,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ONEHANDED_WEAPON),
      weight: 4,
    });
  } else if (props.name === "quarterstaff") {
    weapon = new Weapon({
      name: props.name,
      damage: "1d6",
      damageType: DamageType.BLUDGEONING,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ONEHANDED_WEAPON),
      weight: 4,
    });
  } else if (props.name === "spear") {
    weapon = new Weapon({
      name: props.name,
      damage: "1d6",
      damageType: DamageType.PIERCING,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ONEHANDED_WEAPON),
      weight: 3,
    });
  }

  //simple ranged weapons

  //armors

  //light armors
  else if (props.name === "leather armor") {
    armor = new Armor({
      name: props.name,
      ac: 11,
      armorClassAbilityType: "dex",
      armorType: ArmorType.LIGHT_ARMOR,
      requirementStrenght: 0,
    });
    ch = "L";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 10,
    });
  } else if (props.name === "studded leather") {
    armor = new Armor({
      name: props.name,
      ac: 12,
      armorClassAbilityType: "dex",
      armorType: ArmorType.LIGHT_ARMOR,
      requirementStrenght: 0,
    });
    ch = "L";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 13,
    });
  } else if (props.name === "hide") {
    armor = new Armor({
      name: props.name,
      ac: 12,
      armorClassAbilityType: "dex",
      armorType: ArmorType.MEDIUM_ARMOR,
      requirementStrenght: 2,
    });
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 6,
    });
  } else if (props.name === "chain shirt") {
    armor = new Armor({
      name: props.name,
      ac: 13,
      armorClassAbilityType: "dex",
      armorType: ArmorType.MEDIUM_ARMOR,
      weight: 20,
      requirementStrenght: 0,
    });
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 20,
    });
  } else if (props.name === "scale mail") {
    armor = new Armor({
      name: props.name,
      ac: 14,
      armorClassAbilityType: "dex",
      armorType: ArmorType.MEDIUM_ARMOR,
      weight: 4,
      requirementStrenght: 5,
    });
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 45,
    });
  } else if (props.name === "breastplate") {
    armor = new Armor({
      name: props.name,
      ac: 14,
      armorClassAbilityType: "dex",
      armorType: ArmorType.MEDIUM_ARMOR,
      requirementStrenght: 0,
    });
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 20,
    });
  } else if (props.name === "half plate") {
    armor = new Armor({
      name: props.name,
      ac: 15,
      armorClassAbilityType: "dex",
      armorType: ArmorType.MEDIUM_ARMOR,
      requirementStrenght: 0,
    });
    ch = "M";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 40,
    });
  } else if (props.name === "ring mail") {
    armor = new Armor({
      name: props.name,
      ac: 14,
      armorClassAbilityType: "str",
      armorType: ArmorType.HEAVY_ARMOR,
      requirementStrenght: 0,
    });
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 40,
    });
  } else if (props.name === "chain mail") {
    armor = new Armor({
      name: props.name,
      ac: 16,
      armorClassAbilityType: "str",
      armorType: ArmorType.HEAVY_ARMOR,
      requirementStrenght: 13,
    });
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 55,
    });
  } else if (props.name === "splint") {
    armor = new Armor({
      name: props.name,
      ac: 17,
      armorClassAbilityType: "str",
      armorType: ArmorType.HEAVY_ARMOR,
      requirementStrenght: 15,
    });
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 60,
    });
  } else if (props.name === "plate") {
    armor = new Armor({
      name: props.name,
      ac: 18,
      armorClassAbilityType: "str",
      armorType: ArmorType.HEAVY_ARMOR,
      requirementStrenght: 15,
    });
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.ARMOR),
      weight: 65,
    });
  } else if (props.name === "shield") {
    armor = new Armor({
      name: props.name,
      ac: 2,
      armorClassAbilityType: "",
      armorType: ArmorType.SHIELD,
      requirementStrenght: 0,
    });
    ch = "H";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(WearableType.SHIELD),
      weight: 6,
    });
  } else if (props.name === "health potion") {
    ch = "!";
    color = Colors.HEALTHPOTION;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new HealthEffect(4, undefined),
      weight: 0.1,
    });
  } else if (props.name === "nutella bun") {
    ch = "@";
    color = Colors.HEALTHPOTION;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new HealthEffect(30, undefined),
      weight: 0.1,
    });
  } else if (props.name === "scroll of lighting bolt") {
    ch = "#";
    color = Colors.SCROLL_OF_LIGHTING;
    blocks = false;
    pickable = pickable = new Pickable({
      selector: new TargetSelector(SelectorType.CLOSEST_MONSTER, 5),
      effect: new HealthEffect(-20, "A lighting bolt strikes!"),
      weight: 0.05,
    });
  } else if (props.name === "scroll of fireball") {
    ch = "#";
    color = Colors.SCROLL_OF_FIREBALL;
    blocks = false;

    pickable = new Pickable({
      selector: new TargetSelector(SelectorType.SELECTED_RANGE, 3),
      effect: new HealthEffect(-12, "hurdur"),
      weight: 0.05,
    });
  } else if (props.name === "scroll of confusion") {
    ch = "#";
    color = Colors.SCROLL_OF_CONFUSION;
    blocks = false;

    pickable = new Pickable({
      selector: new TargetSelector(SelectorType.SELECTED_MONSTER, 5),
      effect: new AiChangeEffect(new ConfusedMonsterAi(10), "confused af"),
      weight: 0.05,
    });
  } else if (props.name === "scroll of map") {
    ch = "#";
    color = Colors.SCROLL_OF_MAP;
    blocks = false;

    pickable = new Pickable({
      selector: undefined,
      effect: new MapClearEffect("All is clear!"),
      weight: 0.05,
    });
  } else {
    console.error(`${name} not found.`);
  }

  const item = new Actor(props.x, props.y, ch, props.name, color);

  item.blocks = blocks;
  item.pickable = pickable;
  item.armor = armor;
  item.weapon = weapon;

  return item;
};
