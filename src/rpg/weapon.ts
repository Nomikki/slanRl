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
  needReload: boolean;
  isReloaded: boolean;

  constructor(props: {
    name: string;
    damage: string;
    damageType: DamageType;
    rangeMax: number;
    needReload: boolean;
  }) {
    this.name = props.name;
    this.damage = props.damage;
    this.damageType = props.damageType;
    this.rangeMax = props.rangeMax;

    this.needReload = props.needReload;
    this.isReloaded = false;
  }
}
