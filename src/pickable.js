"use strict";

import { game } from ".";
import { ConfusedAI } from "./ai";

export default class Pickable {
  constructor() {}

  pick(owner, wearer) {
    if (wearer.container && wearer.container.add(owner)) {
      game.removeActor(owner);
      return true;
    }
    return false;
  }

  use(owner, wearer) {
    game.log.add("You use a " + owner.name);
    if (wearer.container) {
      wearer.container.remove(owner);
      return true;
    }
    return false;
  }
}

export class Healer extends Pickable {
  constructor(amount) {
    super();
    this.amount = amount;
  }

  use(owner, wearer) {
    if (wearer.destructible) {
      const amountHealed = wearer.destructible.heal(this.amount);
      if (amountHealed > 0) {
        return super.use(owner, wearer);
      }
    }
    return false;
  }
}

export class LightningBolt extends Pickable {
  constructor(range, damage) {
    super();
    this.range = range;
    this.damage = damage;
  }

  use(owner, wearer) {
    const closestMonster = game.getClosestMonster(
      wearer.x,
      wearer.y,
      this.range
    );
    if (!closestMonster) {
      game.log.add("No enemy is close enough to strike.");
      return false;
    }

    game.log.add(
      "A lighting bolt strikes the " +
        closestMonster.name +
        " with a loud thunder!",
      "#0FF"
    );
    game.log.add("The damage is " + this.damage + " hit points.", "#0FF");

    closestMonster.destructible.takeDamage(closestMonster, this.damage);
    return super.use(owner, wearer);
  }
}

export class Fireball extends Pickable {
  constructor(range, damage) {
    super();
    this.range = range;
    this.damage = damage;
  }

  async use(owner, wearer) {
    game.log.add(
      "Use arrow keys to target tile for fireball. Enter to select target. Esc to cancel."
    );
    const tilePick = await game.pickATile(wearer.x, wearer.y);

    if (tilePick[0] == true) {
      game.log.add(
        "The fireball explodes, burning everything within " +
          this.range +
          " tiles!",
        "#FA0"
      );

      //for (let i = 0; i < game.actors.length; i++) {
      for (const actor of game.actors) {
        if (
          actor.destructible &&
          !actor.destructible.isDead() &&
          actor.getDistance(tilePick[1], tilePick[2]) < this.range
        ) {
          game.log.add(
            "The " +
              actor.name +
              " gets burned for " +
              this.damage +
              " hit points.",
            "#FA0"
          );
          actor.destructible.takeDamage(actor, this.damage);
        }
      }

      return super.use(owner, wearer);
    }

    return false;
  }
}

export class Confuser extends Pickable {
  constructor(nbTurns, range) {
    super();
    this.nbTurns = nbTurns;
    this.range = range;
  }

  async use(owner, wearer) {
    game.log.add(
      "Arrow keys to select a creature. Enter to select target. Esc to cancel."
    );
    const tilePick = await game.pickATile(wearer.x, wearer.y);
    console.log(tilePick);
    
    if (tilePick == null || tilePick[0] === false) {
      return false;
    }

    const actor = game.getActor(tilePick[1], tilePick[2]);
    if (!actor) {
      return false;
    }

    const ai = new ConfusedAI(this.nbTurns, actor.ai);
    actor.ai = ai;
    
    game.log.add("The eyes of the " + actor.name + " look vacant",  "#AFD");
    game.log.add("as he starts to stumble around!",  "#AFD");

    return super.use(owner, wearer);
  }
}
