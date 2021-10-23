import { game } from '.';
import Actor, { X, Y } from './actor';
import { XP } from './destructible';
import { Menu } from './menu';
import Randomizer from './random';
import { ensure } from './utils';
export const random = new Randomizer();

export type AiType = 'player' | 'monster' | 'confused' | 'unknown';

export interface AiBase {
  type: AiType;
}

export default class AI implements AiBase {
  type: AiType = 'unknown';
}

export class PlayerAI extends AI {
  type: 'player' = 'player';
  xpLevel: XP = 1;

  getNextLevelXP() {
    const LEVEL_UP_BASE = 200;
    const LEVEL_UP_FACTOR = 150;

    return LEVEL_UP_BASE + this.xpLevel * LEVEL_UP_FACTOR;
  }

  async update(owner: Actor) {
    const levelUpXp = this.getNextLevelXP();
    const destructible = ensure(owner.destructible);
    if (destructible.xp >= levelUpXp) {
      this.xpLevel++;
      destructible.xp -= levelUpXp;
      game.log.add(
        `Your battle skills grow stronger! You reached level ${this.xpLevel}`,
        '#FFFF00',
      );

      game.menu = new Menu();
      game.menu.clear();
      game.menu.addItem(
        game.menu.constants.CONSTITUTION,
        'Constitution (+20 hp)',
      );
      game.menu.addItem(game.menu.constants.STRENGTH, 'Strenght (+1 attack)');
      game.menu.addItem(game.menu.constants.AGILITY, 'Agility (+1 defense)');

      let cursor = 0;
      let selectedItem = -1;
      while (true) {
        game.clear();
        game.renderUI();
        game.drawChar('>', game.width / 2 - 12, 10 + cursor, '#FFF');
        for (let i = 0; i < game.menu.items.length; i++) {
          game.drawText(game.menu.items[i].label, game.width / 2 - 10, 10 + i);
        }

        const ch = await game.getch();
        if (ch === 'ArrowDown') cursor++;
        if (ch === 'ArrowUp') cursor--;
        if (ch === 'Enter') {
          selectedItem = game.menu.items[cursor].code;
          break;
        }

        cursor = cursor % game.menu.items.length;
        if (cursor < 0) cursor = game.menu.items.length - 1;
      }

      if (selectedItem != -1) {
        if (selectedItem === game.menu.constants.CONSTITUTION) {
          destructible.hp += 20;
          destructible.maxHP += 20;
        }

        if (selectedItem === game.menu.constants.STRENGTH) {
          ensure(owner.attacker).power += 1;
        }

        if (selectedItem === game.menu.constants.AGILITY) {
          destructible.defense += 1;
        }
      }

      game.render();
    }

    if (owner.destructible && owner.destructible.isDead()) return;

    let dx = 0;
    let dy = 0;
    const ch = await game.getch();

    switch (ch) {
      case 'ArrowLeft':
        dx--;
        break;
      case 'ArrowRight':
        dx++;
        break;
      case 'ArrowUp':
        dy--;
        break;
      case 'ArrowDown':
        dy++;
        break;
      default:
        await this.handleActionKey(owner, ch);
        break;
    }

    if (dx !== 0 || dy !== 0) {
      game.gameStatus = game.GameStatus.NEW_TURN;

      if (this.moveOrAttack(owner, owner.x + dx, owner.y + dy)) {
        game.player?.computeFov();
      }
    }
  }

  async handleActionKey(owner: Actor, ascii: string) {
    console.log(ascii);

    const handleSave = () => {
      game.save();
      game.log.add('Game saved...', '#0FA');
    };

    const handleNextLevel = () => {
      if (game.stairs?.x === owner.x && game.stairs?.y === owner.y) {
        game.nextLevel();
      } else {
        game.log.add('There are no stairs here.');
      }
    };

    const handlePickup = () => {
      game.gameStatus = game.GameStatus.NEW_TURN;
      let found = false;
      for (const actor of game.actors) {
        if (actor.pickable && actor.x === owner.x && actor.y === owner.y) {
          if (actor.pickable.pick(actor, owner)) {
            found = true;
            game.log.add(`You pick up the ${actor.name}`, '#AAA');
            break;
          } else if (!found) {
            found = true;
            game.log.add('Your inventory is full.', '#F00');
          }
        }
      }
      if (!found) {
        game.log.add("There's nothing here that you can pick up.");
      }
    };

    const handleUseItem = async () => {
      game.log.add('Use item');
      const useItem = await this.choseFromInventory(owner);
      if (useItem) {
        await useItem.pickable?.use(useItem, owner);
        game.gameStatus = game.GameStatus.NEW_TURN;
      } else {
        game.log.add('Nevermind...');
      }
    };

    const handleDropItem = async () => {
      const dropItem = await this.choseFromInventory(owner);
      if (dropItem) {
        await dropItem.pickable?.drop(dropItem, owner);
        game.gameStatus = game.GameStatus.NEW_TURN;
      } else {
        game.log.add('Nevermind...');
      }
    };

    switch (ascii) {
      case 'S': //save
        handleSave();
        break;

      case '>': //go down
        handleNextLevel();
        break;
      case 'g': //pickup item
        handlePickup();
        break;

      case 'i': //use item
        await handleUseItem();
        break;

      case 'd': //drop item
        await handleDropItem();
        break;
      default:
        break;
    }
  }

  moveOrAttack(owner: Actor, targetX: X, targetY: Y) {
    if (game.map?.isWall(targetX, targetY)) return false;

    for (const actor of game.actors) {
      if (
        actor.destructible &&
        !actor.destructible.isDead() &&
        actor.x === targetX &&
        actor.y === targetY
      ) {
        owner.attacker?.attack(owner, actor);
        return false;
      }
    }

    //look for corpses or items
    for (const actor of game.actors) {
      const corpseOrItem =
        (actor.destructible && actor.destructible.isDead) || actor.pickable;

      if (corpseOrItem && actor.x === targetX && actor.y === targetY) {
        game.log.add(`There is a ${actor.name} here`);
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
          game.drawChar('-', x + 20, y, '#AAA');
        else if ((x === 0 || x === 39) && y > 0 && y < 27)
          game.drawChar('|', x + 20, y, '#AAA');
        else if (y === 0 || x === 0 || y === 27 || x === 39)
          game.drawChar('+', x + 20, y, '#AAA');
        else game.drawChar(' ', x + 20, y);
      }
    }
    game.drawText(' INVENTORY ', 34, 0);
    //game.renderUI();

    const container = ensure(owner.container);

    let shortcut = 'a';
    let i = 0;
    for (const it of container.inventory) {
      game.drawText(shortcut + ') ' + it.name, 22, 2 + i);
      shortcut = String.fromCharCode(shortcut.charCodeAt(0) + 1);
      i++;
    }

    const ch = await game.getch();
    const actorIndex = ch.charCodeAt(0) - 97; //97 = a
    if (actorIndex >= 0 && actorIndex < container.inventory.length) {
      return container.inventory[actorIndex];
    }
    return null;
  }
}

export class MonsterAI extends AI {
  type: 'monster' = 'monster';
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
    const player = game.player;
    if ((owner.destructible && owner.destructible.isDead()) || !player) {
      return;
    }

    if (player.fov?.isInFov(owner.x, owner.y)) {
      this.moveCount = this.Constants.TRACKING_TURNS;
    } else {
      this.moveCount--;
    }

    if (this.moveCount > 0) {
      this.moveOrAttack(owner, player.x, player.y);
    }
  }

  moveOrAttack(owner: Actor, targetX: X, targetY: Y) {
    let dx = targetX - owner.x;
    let dy = targetY - owner.y;
    const stepdx = dx > 0 ? 1 : -1;
    const stepdy = dy > 0 ? 1 : -1;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const player = ensure(game.player);

    if (distance >= 2) {
      dx = Math.round(dx / distance);
      dy = Math.round(dy / distance);

      if (game.map?.canWalk(owner.x + dx, owner.y + dy)) {
        owner.x += dx | 0;
        owner.y += dy | 0;
      } else if (game.map?.canWalk(owner.x + stepdx, owner.y)) {
        owner.x += stepdx | 0;
      } else if (game.map?.canWalk(owner.x, owner.y + stepdy)) {
        owner.y += stepdy | 0;
      }
    } else {
      owner.attacker?.attack(owner, player);
    }
  }
}

export class ConfusedAI extends AI {
  type: 'confused' = 'confused';
  nbTurns: number;
  oldAi: PlayerAI | MonsterAI | ConfusedAI;

  constructor(nbTurns: number, oldAi: PlayerAI | MonsterAI | ConfusedAI) {
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

      if (game.map?.canWalk(destx, desty)) {
        owner.x = destx;
        owner.y = desty;
      } else {
        const actor = game.getActor(destx, desty);
        if (actor) {
          owner.attacker?.attack(owner, actor);
        }
      }
    }
    this.nbTurns--;
    if (this.nbTurns <= 0) {
      owner.ai = this.oldAi;
    }
  }
}
