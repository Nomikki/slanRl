export enum DamageType {
  BLUDGEONING,
  PIERCING,
  SLASHING,
}

export default class Weapon {
  name: string;
  damage: string;
  damageType: DamageType;

  constructor(props: { name: string; damage: string; damageType: DamageType }) {
    this.name = props.name;
    this.damage = props.damage;
    this.damageType = props.damageType;
  }
}
