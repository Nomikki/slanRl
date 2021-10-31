import armorsJson from "../data/armors.json";
import itemsJson from "../data/items.json";
import weaponsJson from "../data/weapons.json";
import Armor, { ArmorType } from "../rpg/armor";
import Weapon, { DamageType } from "../rpg/weapon";
import Actor from "../units/actor";
import { ConfusedMonsterAi } from "../units/ai";
import { Colors } from "../utils/colors";
import { ensure } from "../utils/utils";
import Pickable, {
  AiChangeEffect,
  HealthEffect,
  MapClearEffect,
  SelectorType,
  TargetSelector,
  Wearable,
  WearableType,
} from "./pickable";

interface ArmorInterface {
  name: string;
  ac: number;
  armorType: string;
  weight: number;
}

interface WeaponInterface {
  name: string;
  damage: string;
  damageType: string;
  weight: number;
  wearableType: string;
}

interface Selector {
  type: string;
  range: number;
}

interface Effect {
  type: string;
  amount: number;
}

interface ItemInterface {
  name: string;
  message: string;
  ch: string;
  color: string;
  weight: number;

  selector: Selector;
  effect: Effect;
}

export const armors: ArmorInterface[] = armorsJson;
export const weapons: WeaponInterface[] = weaponsJson;
export const items: ItemInterface[] = itemsJson;

const getArmorUsingFind = (name: string): ArmorInterface | undefined => {
  return armors.find(item => item.name === name);
};

const getWeaponsUsingFind = (name: string): WeaponInterface | undefined => {
  return weapons.find(item => item.name === name);
};

const getItemsUsingFind = (name: string): ItemInterface | undefined => {
  return items.find(item => item.name === name);
};

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

  let armorType = ArmorType.LIGHT_ARMOR;

  const isArmor = (name: string): boolean => {
    for (const n of armors) {
      if (n.name === name) return true;
    }
    return false;
  };

  const isWeapon = (name: string): boolean => {
    for (const n of weapons) {
      if (n.name === name) return true;
    }
    return false;
  };

  const isItem = (name: string): boolean => {
    for (const n of items) {
      if (n.name === name) return true;
    }
    return false;
  };

  //simple melee weapons
  if (isWeapon(props.name)) {
    const weaponTemplate = ensure(getWeaponsUsingFind(props.name));
    let damageType = DamageType.BLUDGEONING;
    let wearableType = WearableType.ONEHANDED_WEAPON;

    if (weaponTemplate.damageType === "bludgeoning")
      damageType = DamageType.BLUDGEONING;
    if (weaponTemplate.damageType === "slashing")
      damageType = DamageType.SLASHING;
    if (weaponTemplate.damageType === "piercing")
      damageType = DamageType.PIERCING;

    if (weaponTemplate.wearableType === "one-handed")
      wearableType = WearableType.ONEHANDED_WEAPON;
    if (weaponTemplate.wearableType === "two-handed")
      wearableType = WearableType.TWOHANDED_WEAPON;

    weapon = new Weapon({
      name: props.name,
      damage: weaponTemplate?.damage,
      damageType: damageType,
    });
    ch = "F";
    color = Colors.WEAPON_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(wearableType),
      weight: weaponTemplate.weight,
    });
  }
  //simple ranged weapons

  //armors
  else if (isArmor(props.name)) {
    const armorTemplate = ensure(getArmorUsingFind(props.name));

    if (armorTemplate.armorType === "light") armorType = ArmorType.LIGHT_ARMOR;
    if (armorTemplate.armorType === "medium")
      armorType = ArmorType.MEDIUM_ARMOR;
    if (armorTemplate.armorType === "heavy") armorType = ArmorType.HEAVY_ARMOR;
    if (armorTemplate.armorType === "shield") armorType = ArmorType.SHIELD;

    armor = new Armor({
      name: props.name,
      ac: armorTemplate.ac,
      armorClassAbilityType:
        armorType === ArmorType.HEAVY_ARMOR ? "str" : "dex",
      armorType: armorType,
      requirementStrenght: 0,
    });
    ch = "L";
    color = Colors.ARMOR_ITEM;
    blocks = false;
    pickable = new Pickable({
      selector: undefined,
      effect: new Wearable(
        armorType === ArmorType.SHIELD
          ? WearableType.SHIELD
          : WearableType.ARMOR,
      ),
      weight: armorTemplate.weight,
    });
  } else if (isItem(props.name)) {
    const itemTemplate = ensure(getItemsUsingFind(props.name));
    ch = itemTemplate.ch;
    color = itemTemplate.color;

    blocks = false;

    let selector = undefined;
    let effect = undefined;

    if (itemTemplate.selector.type === "selected range")
      selector = new TargetSelector(
        SelectorType.SELECTED_RANGE,
        itemTemplate.selector.range,
      );
    if (itemTemplate.selector.type === "selected monster")
      selector = new TargetSelector(
        SelectorType.SELECTED_MONSTER,
        itemTemplate.selector.range,
      );
    if (itemTemplate.selector.type === "closest monster")
      selector = new TargetSelector(
        SelectorType.CLOSEST_MONSTER,
        itemTemplate.selector.range,
      );

    if (itemTemplate.effect.type === "health")
      effect = new HealthEffect(
        itemTemplate.effect.amount,
        itemTemplate.message,
      );
    if (itemTemplate.effect.type === "map clear")
      effect = new MapClearEffect(itemTemplate.message);
    if (itemTemplate.effect.type === "change ai")
      effect = new AiChangeEffect(
        new ConfusedMonsterAi(itemTemplate.effect.amount),
        itemTemplate.message,
      );

    pickable = new Pickable({
      selector: selector,
      effect: effect,
      weight: itemTemplate.weight,
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
