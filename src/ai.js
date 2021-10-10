import { game } from ".";

export default class AI {
  constructor() {}

  update(owner) {}
}

export class PlayerAI extends AI {
  constructor() {
    super();
  }

  async update(owner) {
    if (owner.destructible && owner.destructible.isDead()) return;

    let dx = 0;
    let dy = 0;
    const ch = await game.getch();

    if (ch === "ArrowLeft") dx--;
    if (ch === "ArrowRight") dx++;
    if (ch === "ArrowUp") dy--;
    if (ch === "ArrowDown") dy++;

    if (dx !== 0 || dy !== 0) {
      game.gameStatus = game.GameStatus.NEW_TURN;

      if (this.moveOrAttack(owner, owner.x + dx, owner.y + dy)) {
        game.player.computeFov();
      }
    }
  }

  moveOrAttack(owner, targetX, targetY) {
    if (game.map.isWall(targetX, targetY)) return false;

    for (let i = 0; i < game.actors.length; i++) {
      const actor = game.actors[i];
      if (
        actor.destructible &&
        !actor.destructible.isDead() &&
        actor.x === targetX &&
        actor.y === targetY
      ) {
        owner.attacker.attack(owner, actor);
        return false;
      }
    }

    //look for corpses
    for (let i = 0; i < game.actors.length; i++) {
      const actor = game.actors[i];
      if (
        actor.destructible &&
        actor.destructible.isDead() &&
        actor.x === targetX &&
        actor.y === targetY
      ) {
        console.log("There is a " + actor.name + " here");
        //return false;
      }
    }

    owner.x = targetX;
    owner.y = targetY;
    return true;
  }
}

export class MonsterAI extends AI {
  constructor() {
    super();
    this.moveCount = 0;

    this.Constants = Object.freeze({
      TRACKING_TURNS: 3,
    });
  }

  update(owner) {
    if (owner.destructible && owner.destructible.isDead()) return;

    if (game.player.fov.isInFov(owner.x, owner.y)) {
      this.moveCount = this.Constants.TRACKING_TURNS;
    } else {
      this.moveCount--;
    }

    if (this.moveCount > 0)
    {
      this.moveOrAttack(owner, game.player.x, game.player.y);
    }
  }

  moveOrAttack(owner, targetX, targetY) {
    let dx = targetX - owner.x;
    let dy = targetY - owner.y;
    const stepdx = (dx > 0 ? 1 : -1);
    const stepdy = (dy > 0 ? 1 : -1);

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= 2) {
      dx = Math.round(dx / distance);
      dy = Math.round(dy / distance);

      if (game.map.canWalk(owner.x + dx, owner.y + dy)) {
        owner.x += dx | 0;
        owner.y += dy | 0;
      } else if (game.map.canWalk(owner.x + stepdx, owner.y))
      {
        owner.x += stepdx | 0;
      } else if (game.map.canWalk(owner.x, owner.y + stepdy))
      {
        owner.y += stepdy | 0;
      }
    } else {
      owner.attacker.attack(owner, game.player);
    }
  }
}
