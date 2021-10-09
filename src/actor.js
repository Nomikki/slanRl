"use strict";

import { game } from ".";

export default class Actor {
  constructor(x, y, ch, name, color) {
    this.x = x | 0;
    this.y = y | 0;
    this.ch = ch;
    this.color = color;
    this.name = name;

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
    
    console.log("The " + this.name + " growls!");
  }

  computeFov() {
    if (this.fov) {
      this.fov.compute(this.x, this.y, 10);
    }
  }

  moveOrAttack(x, y) {
    if (game.map.isWall(x, y)) return false;
    for (let i = 0; i < game.actors.length; i++) {
      const actor = game.actors[i];
      if (actor.x === x && actor.y === y && actor !== this) {
        console.log("The " + actor.name + " laughs at your puny efforts to attack him!");
        return false;
      }
    }

    this.x = x;
    this.y = y;
    return true;
  }
}
