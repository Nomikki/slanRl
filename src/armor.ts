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

  constructor(props: {
    name: string;
    ac: number;
    armorClassAbilityType: string;
    armorType: ArmorType;
    weight: number;
    requirementStrenght: number;
  }) {
    this.name = props.name;
    this.armorClass = props.ac;
    this.armorClassAbilityType = props.armorClassAbilityType;
    this.armorType = props.armorType;
    this.weight = props.weight;
    this.armorRequirementStrenght = props?.requirementStrenght;
  }
}
