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
    this.blocks = true; //can we walk on this actor?

    // Destructible: Something that can take damage and potentially break or die
    this.destructible = null;

    // Attacker: Something that can deal damage to a Destructible
    this.attacler = null;

    // Ai: Something that is self-updating
    this.ai = null;
  }

  render() {
    const fovValue = game.player.fov.getMapped(this.x, this.y);
    if (fovValue === 2 || (fovValue != 0 && !this.fovOnly)) {
      game.drawChar(this.ch, this.x, this.y, this.color);
    }
  }

  async update() {
    //console.log("The " + this.name + " growls!");
    if (this.ai) {
      
      await this.ai.update(this);
    }
  }

  computeFov() {
    if (this.fov) {
      this.fov.compute(this.x, this.y, 10);
    }
  }

 
}
