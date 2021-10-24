export enum ABILITIES {
  STR,
  DEX,
  CON,
  INT,
  WIS,
}

export class Abilities {
  str = 0;
  dex = 0;
  con = 0;
  int = 0;
  wis = 0;

  constructor(str: number, dex: number, con: number, int: number, wis: number) {
    this.str = str;
    this.dex = dex;
    this.con = con;
    this.int = int;
    this.wis = wis;
  }

  getBonus(type: ABILITIES): number {
    let val = 0;
    switch (type) {
      case ABILITIES.STR:
        val = this.str;
        break;
      case ABILITIES.DEX:
        val = this.dex;
        break;
      case ABILITIES.CON:
        val = this.con;
        break;
      case ABILITIES.INT:
        val = this.int;
        break;
      case ABILITIES.WIS:
        val = this.wis;
        break;
      default:
        break;
    }

    return Math.floor((val - 10) / 2);
  }

  getBonusWithSign(type: ABILITIES): string {
    const val = this.getBonus(type);
    return (val >= 0 ? "+" : "") + val.toString();
  }
}
