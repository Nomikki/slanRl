import { ensure } from "@/utils";

let _seed = 0;

class Randomizer {
  rnd: number;

  constructor() {
    this.rnd = 0;
  }

  setSeed(seed: number) {
    _seed = seed;
  }

  calc() {
    _seed = (_seed * 9301 + 49297) % 233280;
    this.rnd = _seed / 233280.0;
  }

  getInt(min: number, max: number): number {
    max = max || 1;
    min = min || 0;
    this.calc();
    return Math.floor(min + this.rnd * (max - min));
  }

  dice(dices: number, eyes: number, bonus = 0): number {
    let v = 0;
    eyes++;
    for (let i = 0; i < dices; i++) {
      v += Number(this.getInt(1, eyes));
    }
    v += +bonus;
    if (v < dices) v = dices;
    return v;
  }

  parseDice(dicesEyesBonus: string): [number, number, number] {
    const bonus = dicesEyesBonus.includes("+")
      ? parseInt(ensure(dicesEyesBonus.split("+").at(1)))
      : 0;
    const [dices, eyes] = dicesEyesBonus.split("d");
    return [parseInt(dices), parseInt(eyes), bonus];
  }
}

export default Randomizer;
