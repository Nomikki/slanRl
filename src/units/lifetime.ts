export default class Lifetime {
  turns = 0;
  constructor(turns: number) {
    //
    this.turns = turns;
  }

  update() {
    //
    this.turns--;
  }
}
