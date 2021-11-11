import { game, GameStatus } from "@/index";
import Actor from "@/units/actor";
import { ensure, float2int } from "@/utils";
import { Colors } from "@/utils/colors";
//import { Menu, MenuItemCode } from "@/utils/menu";
import Randomizer from "@/utils/random";

export const random = new Randomizer();

export default class AI {}

export class PlayerAI extends AI {
  xpLevel: number;

  constructor() {
    super();
    this.xpLevel = 1;
  }

  getNextLevelXP() {
    const LEVEL_UP_BASE = 200;
    const LEVEL_UP_FACTOR = 150;

    return LEVEL_UP_BASE + this.xpLevel * LEVEL_UP_FACTOR;
  }

  async pickDirection() {
    const ch = await game.getch();

    let dx = 0;
    let dy = 0;
    if (ch === "ArrowLeft") {
      dx = -1;
    }
    if (ch === "ArrowRight") {
      dx = 1;
    }
    if (ch === "ArrowUp") {
      dy = -1;
    }
    if (ch === "ArrowDown") {
      dy = 1;
    }

    return [dx, dy];
  }

  async update(owner: Actor) {
    const levelUpXp = this.getNextLevelXP();

    if (ensure(owner.destructible).xp >= levelUpXp) {
      this.xpLevel++;
      ensure(owner.destructible).xp -= levelUpXp;
      game.log.add(
        `Your battle skills grow stronger! You reached level ${this.xpLevel}`,
        Colors.LEVEL_UP,
      );

      /*

      game.menu = new Menu();
      game.menu.clear();
      game.menu.addItem(MenuItemCode.CONSTITUTION, "Constitution (+20 hp)");
      game.menu.addItem(MenuItemCode.STRENGTH, "Strenght (+1 attack)");
      game.menu.addItem(MenuItemCode.AGILITY, "Agility (+1 defense)");

      let cursor = 0;
      let selectedItem = -1;
      while (true) {
        game.clear();
        game.renderUI();
        game.drawChar(
          ">",
          game.width / 2 - 12,
          10 + cursor,
          Colors.MENU_CURSOR,
        );
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

        
        if (selectedItem === MenuItemCode.CONSTITUTION) {
          ensure(owner.destructible).hp += 20;
          ensure(owner.destructible).maxHP += 20;
        }

        if (selectedItem === MenuItemCode.STRENGTH) {
          ensure(owner.attacker).power += 1;
        }

        if (selectedItem === MenuItemCode.AGILITY) {
          ensure(owner.destructible).defense += 1;
        }
        
      }
    */

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
      game.gameStatus = GameStatus.NEW_TURN;

      if (await this.moveOrAttack(owner, owner.x + dx, owner.y + dy)) {
        game.player?.computeFov();
        game.camera.compute(ensure(game.player?.x), ensure(game.player?.y));
      }
    }
  }

  async handleActionKey(owner: Actor, ascii: string) {
    const handleOpen = async () => {
      game.log.add("Which direction?");
      game.render();

      const [dx, dy] = await this.pickDirection();

      if (!game?.map?.openCloseDoor(owner.x + dx, owner.y + dy)) {
        game.log.add("There is no any door.");
      }
      game.player?.computeFov();
      game.gameStatus = GameStatus.NEW_TURN;
    };

    const handleSave = async () => {
      game.save();
      game.log.add("Game saved...", Colors.GAME_SAVED);
    };

    const handleNextLevel = () => {
      if (game.stairs?.x === owner.x && game.stairs?.y === owner.y) {
        game.nextLevel();
      } else {
        game.log.add("There are no stairs here.");
      }
    };

    const handlePickup = () => {
      game.gameStatus = GameStatus.NEW_TURN;
      let found = false;
      for (const actor of game.actors) {
        if (actor.pickable && actor.x === owner.x && actor.y === owner.y) {
          if (actor.pickable.pick(actor, owner)) {
            found = true;
            game.log.add(`You pick up the ${actor.name}`, Colors.PICKED_UP);
            break;
          } else if (!found) {
            found = true;
            game.log.add("Your inventory is full.", Colors.INVENTORY_FULL);
          }
        }
      }
      if (!found) {
        game.log.add("There's nothing here that you can pick up.");
      }
    };

    const handleUseItem = async () => {
      game.log.add("Use item");
      const useItem = await this.choseFromInventory(owner);
      if (useItem) {
        await ensure(useItem.pickable).use(useItem, owner);
        game.gameStatus = GameStatus.NEW_TURN;
      } else {
        game.log.add("Nevermind...");
      }
    };

    const handleDropItem = async () => {
      const dropItem = await this.choseFromInventory(owner);
      if (dropItem) {
        await ensure(dropItem.pickable).drop(dropItem, owner);
        game.gameStatus = GameStatus.NEW_TURN;
      } else {
        game.log.add("Nevermind...");
      }
    };

    const handleWield = async () => {
      const wieldedItem = await this.choseFromInventory(owner);
      if (wieldedItem) {
        //game.log.add(`You wield up the ${wieldedItem.name}`, Colors.PICKED_UP);
        await ensure(wieldedItem.pickable).wear(wieldedItem, owner);
        game.gameStatus = GameStatus.NEW_TURN;
      } else {
        game.log.add("Nevermind...");
      }
    };

    const handleShooting = async () => {
      //lets find out if any bow/shooting weapon is equipped
      const rangeWeapon = owner.equipments?.getRangeWeapon();
      if (rangeWeapon) {
        //if it, pick target tile
        const [isOnRange, tileX, tileY] = await game.pickATile(
          owner.x,
          owner.y,
          rangeWeapon.weapon?.rangeMax,
        );

        if (isOnRange) {
          owner.attacker?.rangeAttack(owner, tileX as number, tileY as number);
          game.gameStatus = GameStatus.NEW_TURN;
        }
      } else {
        game.log.add("Can't shoot. You need ranged weapon first.");
      }
    };

    //this feature is disabled for now
    /*
    const handleFov = () => {
      game.player?.fov?.showAll();
      game.saveImage();
    };
    */

    const handleHelpInfo = () => {
      game.log.add("Use ARROW KEYS to move and attacks");
      game.log.add("s: Shoot");
      game.log.add("g: Pick up a item.");
      game.log.add("i: Use item");
      game.log.add("d: Drop item from inventory");
      game.log.add(">: Use stairs");
      game.log.add("o: Open or close door.");
      game.log.add("w: Wear/equip");
    };

    switch (ascii) {
      case "S": //save
        handleSave();
        break;

      case ">": //go down
        handleNextLevel();
        break;

      case "g": //pickup item
        handlePickup();
        break;

      case "i": //use item
        await handleUseItem();
        break;

      case "d": //drop item
        await handleDropItem();
        break;

      case "o": //open
        await handleOpen();
        break;

      case "w": //wield
        await handleWield();
        break;

      case "s": //shoort
        await handleShooting();
        break;
      case "?": //wield
        handleHelpInfo();
        break;

      /*
      case "f":
        handleFov();
        break;
        */

      default:
        break;
    }
  }

  async moveOrAttack(owner: Actor, targetX: number, targetY: number) {
    if (game.map?.isWall(targetX, targetY)) return false; //move
    let doorFound = false;

    for (const actor of game.actors) {
      if (
        actor.destructible &&
        !actor.destructible.isDead() &&
        actor.x === targetX &&
        actor.y === targetY
      ) {
        await ensure(owner.attacker).attack(owner, actor);
        return false; //attack
      }
    }

    //look for corpses or items
    for (const actor of game.actors) {
      const corpseOrItem =
        (actor.destructible && actor.destructible.isDead) ||
        actor.pickable ||
        (actor.name === "door" && actor.ch === "D");

      if (corpseOrItem && actor.x === targetX && actor.y === targetY) {
        game.log.add(`There is a ${actor.name} here`);
      }
      if (
        actor.name === "door" &&
        actor.blocks &&
        actor.x === targetX &&
        actor.y === targetY
      ) {
        doorFound = true;
      }
    }

    if (doorFound) {
      return false;
    }

    owner.x = targetX;
    owner.y = targetY;
    return true;
  }

  async choseFromInventory(owner: Actor) {
    game.clear();
    game.render();
    if (owner.container) owner.container.render();

    const ch = await game.getch();
    const actorIndex = ch.charCodeAt(0) - 97; //97 = a
    if (
      actorIndex >= 0 &&
      actorIndex < ensure(owner.container).inventory.length
    ) {
      return ensure(owner.container).inventory[actorIndex];
    }
    return null;
  }
}

export class MonsterAI extends AI {
  moveCount: number;
  readonly TRACKING_TURNS: number = 3;

  constructor() {
    super();
    this.moveCount = 0;
  }

  async update(owner: Actor) {
    const player = game.player;

    if ((owner.destructible && owner.destructible.isDead()) || !player) return;

    if (game.player?.fov?.isInFov(owner.x, owner.y)) {
      this.moveCount = this.TRACKING_TURNS;
    } else {
      this.moveCount--;
    }

    if (this.moveCount > 0) {
      this.moveOrAttack(owner, player.x, player.y);
    }
  }

  moveOrAttack(owner: Actor, targetX: number, targetY: number) {
    let dx = targetX - owner.x;
    let dy = targetY - owner.y;
    const stepdx = dx > 0 ? 1 : -1;
    const stepdy = dy > 0 ? 1 : -1;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= 2) {
      dx = Math.round(dx / distance);
      dy = Math.round(dy / distance);

      if (game.map?.canWalk(owner.x + dx, owner.y + dy)) {
        owner.x += float2int(dx);
        owner.y += float2int(dy);
      } else if (game.map?.canWalk(owner.x + stepdx, owner.y)) {
        owner.x += float2int(stepdx);
      } else if (game.map?.canWalk(owner.x, owner.y + stepdy)) {
        owner.y += float2int(stepdy);
      }
    } else {
      owner?.attacker?.attack(owner, ensure(game.player));
    }
  }
}

export class ConfusedAI extends AI {
  nbTurns: number;
  oldAi?: MonsterAI | PlayerAI | ConfusedAI;

  constructor(
    nbTurns: number,
    oldAi: MonsterAI | PlayerAI | ConfusedAI | undefined,
  ) {
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
          owner?.attacker?.attack(owner, actor);
        }
      }
    }
    this.nbTurns--;
    if (this.nbTurns <= 0) {
      owner.ai = this.oldAi;
    }
  }
}

export class TemporaryAI extends AI {
  nbTurns: number;
  oldAi?: MonsterAI | PlayerAI | ConfusedAI;

  constructor(nbTurns: number) {
    super();
    this.nbTurns = nbTurns;
  }

  async update(owner: Actor) {
    this.nbTurns--;
    if (this.nbTurns === 0) {
      owner.ai = this.oldAi;
    }
  }

  applyTo(actor: Actor) {
    this.oldAi = actor.ai;
    actor.ai = this;
  }
}

export class ConfusedMonsterAi extends TemporaryAI {
  constructor(nbTurns: number) {
    super(nbTurns);
  }

  async update(owner: Actor) {
    const dx = random.getInt(-1, 1);
    const dy = random.getInt(-1, 1);
    if (dx != 0 || dy != 0) {
      const destx = owner.x + dx;
      const desty = owner.y + dy;

      if (game.map?.canWalk(destx, desty)) {
        owner.x = destx;
        owner.y = desty;
      } else {
        const actor = game.getActor(destx, desty);
        if (actor) {
          owner?.attacker?.attack(owner, actor);
        }
      }
    }
    super.update(owner);
  }
}
