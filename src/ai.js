"use strict";

import { game } from ".";
import Randomizer from "./random";
export const random = new Randomizer();

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

    switch (ch) {
      case "ArrowLeft":
        dx--;
        break;
      case "ArrowRight":
        dx++;
        break;
      case "ArrowUp":
        dy--;
        break;
      case "ArrowDown":
        dy++;
        break;
      default:
        await this.handleActionKey(owner, ch);
        break;
    }

    if (dx !== 0 || dy !== 0) {
      game.gameStatus = game.GameStatus.NEW_TURN;

      if (this.moveOrAttack(owner, owner.x + dx, owner.y + dy)) {
        game.player.computeFov();
      }
    }
  }

  async handleActionKey(owner, ascii) {
    console.log(ascii);

    switch (ascii) {
      case "S": //save
        game.save();
        game.log.add("Game saved...", "#0FA");
        break;

      case ">": //go down
        if (game.stairs.x === owner.x && game.stairs.y === owner.y)
        {
          game.nextLevel();
        } else {
          game.log.add("There are no stairs here.");
        }
        break;
      case "g": //pickup item
        game.gameStatus = game.GameStatus.NEW_TURN;
        let found = false;
        for (const actor of game.actors) {
          if (actor.pickable && actor.x === owner.x && actor.y === owner.y) {
            if (actor.pickable.pick(actor, owner)) {
              found = true;
              game.log.add("You pick up the " + actor.name, "#AAA");
              break;
            } else if (!found) {
              found = true;
              game.log.add("Your inventory is full.", "#F00");
            }
          }
        }
        if (!found) {
          game.log.add("There's nothing here that you can pick up.");
        }
        break;

      case "i": //use item
        game.log.add("Use item");
        const useItem = await this.choseFromInventory(owner);
        if (useItem) {
          await useItem.pickable.use(useItem, owner);
          game.gameStatus = game.GameStatus.NEW_TURN;
        } else {
          game.log.add("Nevermind...");
        }
        break;

      case "d": //drop item
        const dropItem = await this.choseFromInventory(owner);
        if (dropItem) {
          await dropItem.pickable.drop(dropItem, owner);
          game.gameStatus = game.GameStatus.NEW_TURN;
        } else {
          game.log.add("Nevermind...");
        }
        break;
      default:
        break;
    }
  }

  moveOrAttack(owner, targetX, targetY) {
    if (game.map.isWall(targetX, targetY)) return false;

    for (const actor of game.actors) {
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

    //look for corpses or items
    for (const actor of game.actors) {
      const corpseOrItem =
        (actor.destructible && actor.destructible.isDead) || actor.pickable;

      if (corpseOrItem && actor.x === targetX && actor.y === targetY) {
        game.log.add("There is a " + actor.name + " here");
      }
    }

    owner.x = targetX;
    owner.y = targetY;
    return true;
  }

  async choseFromInventory(owner) {
    game.clear();
    game.render();
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 40; x++) {
        if ((y === 0 || y === 27) && x > 0 && x < 39)
          game.drawChar("-", x + 20, y, "#AAA");
        else if ((x === 0 || x === 39) && y > 0 && y < 27)
          game.drawChar("|", x + 20, y, "#AAA");
        else if (y === 0 || x === 0 || y === 27 || x === 39)
          game.drawChar("+", x + 20, y, "#AAA");
        else game.drawChar(" ", x + 20, y);
      }
    }
    game.drawText(" INVENTORY ", 34, 0);
    //game.renderUI();

    let shortcut = "a";
    let i = 0;
    for (const it of owner.container.inventory) {
      game.drawText(shortcut + ") " + it.name, 22, 2 + i);
      shortcut = String.fromCharCode(shortcut.charCodeAt(0) + 1);
      i++;
    }

    let ch = await game.getch();
    const actorIndex = ch.charCodeAt(0) - 97; //97 = a
    if (actorIndex >= 0 && actorIndex < owner.container.inventory.length) {
      return owner.container.inventory[actorIndex];
    }
    return null;
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

  async update(owner) {
    if (owner.destructible && owner.destructible.isDead()) return;

    if (game.player.fov.isInFov(owner.x, owner.y)) {
      this.moveCount = this.Constants.TRACKING_TURNS;
    } else {
      this.moveCount--;
    }

    if (this.moveCount > 0) {
      this.moveOrAttack(owner, game.player.x, game.player.y);
    }
  }

  moveOrAttack(owner, targetX, targetY) {
    let dx = targetX - owner.x;
    let dy = targetY - owner.y;
    const stepdx = dx > 0 ? 1 : -1;
    const stepdy = dy > 0 ? 1 : -1;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= 2) {
      dx = Math.round(dx / distance);
      dy = Math.round(dy / distance);

      if (game.map.canWalk(owner.x + dx, owner.y + dy)) {
        owner.x += dx | 0;
        owner.y += dy | 0;
      } else if (game.map.canWalk(owner.x + stepdx, owner.y)) {
        owner.x += stepdx | 0;
      } else if (game.map.canWalk(owner.x, owner.y + stepdy)) {
        owner.y += stepdy | 0;
      }
    } else {
      owner.attacker.attack(owner, game.player);
    }
  }
}

export class ConfusedAI extends AI {
  constructor(nbTurns, oldAi) {
    super();
    this.nbTurns = nbTurns;
    this.oldAi = oldAi;
  }

  async update(owner) {
    const dx = random.getInt(-1, 1);
    const dy = random.getInt(-1, 1);

    if (dx !== 0 || dy !== 0) {
      const destx = owner.x + dx;
      const desty = owner.y + dy;

      if (game.map.canWalk(destx, desty)) {
        owner.x = destx;
        owner.y = desty;
      } else {
        const actor = game.getActor(destx, desty);
        if (actor) {
          owner.attacker.attack(owner, actor);
        }
      }
    }
    this.nbTurns--;
    if (this.nbTurns <= 0) {
      owner.ai = this.oldAi;
    }
  }
}
