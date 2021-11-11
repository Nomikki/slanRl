export enum DamageType {
  BLUDGEONING,
  PIERCING,
  SLASHING,
}

export default class Weapon {
  name: string;
  damage: string;
  damageType: DamageType;
  rangeMax: number;

  constructor(props: {
    name: string;
    damage: string;
    damageType: DamageType;
    rangeMax: number;
  }) {
    this.name = props.name;
    this.damage = props.damage;
    this.damageType = props.damageType;
    this.rangeMax = props.rangeMax;
  }
}
