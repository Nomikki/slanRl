"use strict";

import { game } from ".";

export default class Actor {
  constructor(x, y, ch, color) {
    this.x = x | 0;
    this.y = y | 0;
    this.ch = ch;
    this.color = color;

    this.fov = null;
    this.fovOnly = true;
  }

  render() {
    const fovValue = game.player.fov.getMapped(this.x, this.y);
    if (fovValue === 2 || (fovValue != 0 && !this.fovOnly)) {
      game.drawChar(this.ch, this.x, this.y, this.color);
    }
  }

  update() {
    this.computeFov();
  }

  computeFov() {
    if (this.fov) {
      this.fov.compute(this.x, this.y, 10);
    }
  }
}
