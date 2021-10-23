"use strict";

import { game } from ".";
import Pickable, {
  AiChangeEffect,
  HealthEffect,
  TargetSelector,
} from "./pickable";
import { ConfusedMonsterAi } from "./ai";

export default class Actor {
  x: number;
  y: number;
  ch: string;
  name: string;
  color: string;

  fov: any = null;
  fovOnly: boolean = true;
  blocks: boolean = true; //can we walk on this actor?

  // Destructible: Something that can take damage and potentially break or die
  destructible: any = null;

  // Attacker: Something that can deal damage to a Destructible
  attacker: any = null;

  // Ai: Something that is self-updating
  ai: any = null;

  // Pickable: Something that can be picked and used
  pickable: any = null;

  // Container: Something that can contain actors
  container: any = null;

  constructor(x: number, y: number, ch: string, name: string, color: string) {
    this.x = x | 0;
    this.y = y | 0;
    this.ch = ch;
    this.color = color;
    this.name = name;
  }

  create(actorTemplate: Actor) {
    console.log(actorTemplate);

    let fx = undefined;
    if (actorTemplate.pickable.effectName === "AiChangeEffect") {
      console.log("!!!");
      fx = new AiChangeEffect(
        new ConfusedMonsterAi(
          parseInt(actorTemplate.pickable.effect.newAi.nbTurns)
        ),
        actorTemplate.pickable.effect.message
      );
    }
    if (actorTemplate.pickable.effectName === "HealthEffect")
      fx = new HealthEffect(actorTemplate.pickable.effect.amount, undefined);

    if (actorTemplate.pickable.selectorName) {
      console.log(actorTemplate.pickable.selectorName);
      this.pickable = new Pickable(
        new TargetSelector(
          parseInt(actorTemplate.pickable.selector.type),
          parseInt(actorTemplate.pickable.selector.range)
        ),
        fx
      );
    } else {
      this.pickable = new Pickable(undefined, fx);
    }

    console.log(this.pickable);
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

  getDistance(x: number, y: number) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
