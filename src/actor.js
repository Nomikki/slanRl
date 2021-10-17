"use strict";

import { game } from ".";
import { Confuser, Fireball, Healer, LightningBolt } from "./pickable";

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
    this.attacker = null;

    // Ai: Something that is self-updating
    this.ai = null;

    // Pickable: Something that can be picked and used
    this.pickable = null;

    // Container: Something that can contain actors
    this.container = null;
  }

  create(actorTemplate) {
    //console.log(actorTemplate);
    if (actorTemplate.pickable.type === "lightingBolt")
      this.pickable = new LightningBolt(
        actorTemplate.pickable.range,
        actorTemplate.pickable.damage
      );

    if (actorTemplate.pickable.type === "fireBall")
      this.pickable = new Fireball(
        actorTemplate.pickable.range,
        actorTemplate.pickable.damage
      );

    if (actorTemplate.pickable.type === "healer")
      this.pickable = new Healer(actorTemplate.pickable.amount);

    if (actorTemplate.pickable.type === "confuser")
      this.pickable = new Confuser(
        actorTemplate.pickable.nbTurns,
        actorTemplate.pickable.range
      );
  }

  render() {
    const fovValue = game.player.fov.getMapped(this.x, this.y);
    if (fovValue === 2 || (fovValue != 0 && !this.fovOnly)) {
      game.drawChar(this.ch, this.x, this.y, this.color);
    }
  }

  async update() {
    if (this.ai) {
      await this.ai.update(this);
    }
  }

  computeFov() {
    if (this.fov) {
      this.fov.compute(this.x, this.y, 10);
    }
  }

  getDistance(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
