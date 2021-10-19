"use strict";

let _seed = 0;

class Randomizer {
  constructor() {
    this.rnd = 0;
  }

  setSeed(seed) {
    _seed = seed;
  }

  calc() {
    _seed = (_seed * 9301 + 49297) % 233280;
    this.rnd = _seed / 233280.0;
  }

  getInt(min, max) {
    max = max || 1;
    min = min || 0;
    this.calc();
    return Math.floor(min + this.rnd * (max - min));
  }

  dice(dices, eyes, bonus = 0) {
    let v = 0;
    eyes++;
    for (let i = 0; i < dices; i++) {
      v += Number(this.getInt(1, eyes));
    }
    v += +bonus;
    if (v < dices) v = dices;
    return v;
  }
}

export default Randomizer;
