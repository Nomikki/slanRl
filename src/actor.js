"use strict";

import { game } from ".";

export default class Actor {
  constructor(x, y, ch, color) {
    this.x = x | 0;
    this.y = y | 0;
    this.ch = ch;
    this.color = color;
  }

  render() {
    game.drawChar(this.ch, this.x, this.y, this.color);

  }
}
