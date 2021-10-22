import { game } from ".";
import Actor, { X, Y } from "./actor";
import { XP } from "./destructible";
import { Menu } from "./menu";
import Randomizer from "./random";
export const random = new Randomizer();

export default class AI {
  constructor() {}

  async update(_owner: Actor) {}
}

export class PlayerAI extends AI {
  xpLevel: XP;

  constructor() {
    super();
    this.xpLevel = 1;
  }

  getNextLevelXP() {
    const LEVEL_UP_BASE = 200;
    const LEVEL_UP_FACTOR = 150;

    return LEVEL_UP_BASE + this.xpLevel * LEVEL_UP_FACTOR;
  }

  async update(owner: Actor) {
    const levelUpXp = this.getNextLevelXP();
    if (owner.destructible.xp >= levelUpXp) {
      this.xpLevel++;
      owner.destructible.xp -= levelUpXp;
      game.log.add(
        "Your battle skills grow stronger! You reached level " + this.xpLevel,
        "#FFFF00"
      );

      game.menu = new Menu();
      game.menu.clear();
      game.menu.addItem(
        game.menu.constants.CONSTITUTION,
        "Constitution (+20 hp)"
      );
      game.menu.addItem(game.menu.constants.STRENGTH, "Strenght (+1 attack)");
      game.menu.addItem(game.menu.constants.AGILITY, "Agility (+1 defense)");

      let cursor = 0;
      let selectedItem = -1;
      while (true) {
        game.clear();
        game.renderUI();
        game.drawChar(">", game.width / 2 - 12, 10 + cursor, "#FFF");
        for (let i = 0; i < game.menu.items.length; i++) {
          game.drawText(game.menu.items[i].label, game.width / 2 - 10, 10 + i);
        }

        const ch = await game.getch();
        if (ch === "ArrowDown") cursor++;
        if (ch === "ArrowUp") cursor--;
        if (ch === "Enter") {
          selectedItem = game.menu.items[cursor].code;
          break;
        }

        cursor = cursor % game.menu.items.length;
        if (cursor < 0) cursor = game.menu.items.length - 1;
      }

      if (selectedItem != -1) {
        if (selectedItem === game.menu.constants.CONSTITUTION) {
          owner.destructible.hp += 20;
          owner.destructible.maxHP += 20;
        }

        if (selectedItem === game.menu.constants.STRENGTH) {
          owner.attacker.power += 1;
        }

        if (selectedItem === game.menu.constants.AGILITY) {
          owner.destructible.defense += 1;
        }
      }

      game.render();
    }

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

  async handleActionKey(owner: Actor, ascii: string) {
    console.log(ascii);

    switch (ascii) {
      case "S": //save
        game.save();
        game.log.add("Game saved...", "#0FA");
        break;

      case ">": //go down
        if (game.stairs.x === owner.x && game.stairs.y === owner.y) {
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

  moveOrAttack(owner: Actor, targetX: X, targetY: Y) {
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

  async choseFromInventory(owner: Actor) {
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
  moveCount: number;
  Constants: Readonly<{ TRACKING_TURNS: number }>;
  constructor() {
    super();
    this.moveCount = 0;

    this.Constants = Object.freeze({
      TRACKING_TURNS: 3,
    });
  }

  async update(owner: Actor) {
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

  moveOrAttack(owner: Actor, targetX: X, targetY: Y) {
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
  nbTurns: number;
  oldAi: number;

  constructor(nbTurns: number, oldAi: number) {
    super();
    this.nbTurns = nbTurns;
    this.oldAi = oldAi;
  }

  async update(owner: Actor) {
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
