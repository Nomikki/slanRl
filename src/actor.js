"use strict";

import { game } from ".";

export default class Actor {
  constructor(x, y, ch, color) {
    this.x = x;
    this.y = y;
    this.ch = ch;
    this.color = color;
  }

  render() {
    game.drawChar(this.ch, this.x, this.y, this.color);

  }
}
