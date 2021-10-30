export enum ArmorType {
  LIGHT_ARMOR,
  MEDIUM_ARMOR,
  HEAVY_ARMOR,
  SHIELD,
}

export default class Armor {
  armorClass: number;
  armorClassAbilityType: string;
  armorType: ArmorType;
  weight: number;
  armorRequirementStrenght: number;
  name: string;

  constructor(
    name: string,
    ac: number,
    armorClassAbilityType: string,
    armorType: ArmorType,
    weight: number,
    requirementStrenght = 0,
  ) {
    this.name = name;
    this.armorClass = ac;
    this.armorClassAbilityType = armorClassAbilityType;
    this.armorType = armorType;
    this.weight = weight;
    this.armorRequirementStrenght = requirementStrenght;
  }
}
