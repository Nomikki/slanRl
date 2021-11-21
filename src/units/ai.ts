import { game, GameStatus } from "@/index";
import { keyBindingsForHelp, keyPress } from "@/keymappings";
import { createSpell, getSpell } from "@/rpg/spellGenerator";
import Actor from "@/units/actor";
import { ensure, float2int } from "@/utils";
import { Colors } from "@/utils/colors";
import Randomizer from "@/utils/random";

export const random = new Randomizer();

export default class AI {
  movingSpeed = 1;
}

export class PlayerAI extends AI {
  xpLevel: number;

  constructor() {
    super();
    this.xpLevel = 1;
    super.movingSpeed = 1;
  }

  getNextLevelXP() {
    const LEVEL_UP_BASE = 200;
    const LEVEL_UP_FACTOR = 150;

    return LEVEL_UP_BASE + this.xpLevel * LEVEL_UP_FACTOR;
  }

  async pickDirection() {
    const ch = keyPress("game", await game.getch());

    if (ch === "MOVE_LEFT") return [-1, 0];
    else if (ch === "MOVE_RIGHT") return [1, 0];
    else if (ch === "MOVE_UP") return [0, -1];
    else if (ch === "MOVE_DOWN") return [0, 1];
    else if (ch === "MOVE_UP_LEFT") return [-1, -1];
    else if (ch === "MOVE_UP_RIGHT") return [1, -1];
    else if (ch === "MOVE_DOWN_LEFT") return [-1, 1];
    else if (ch === "MOVE_DOWN_RIGHT") return [1, 1];

    return [0, 0];
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

      game.render();
    }

    if (owner.destructible && owner.destructible.isDead()) return;

    let dx = 0;
    let dy = 0;
    const ch = keyPress("game", await game.getch());
    switch (ch) {
      case "MOVE_LEFT": //left
        dx--;
        break;
      case "MOVE_RIGHT": //right
        dx++;
        break;
      case "MOVE_UP": //up
        dy--;
        break;
      case "MOVE_DOWN": //down
        dy++;
        break;
      case "MOVE_UP_LEFT": //left-top
        dx--;
        dy--;
        break;
      case "MOVE_UP_RIGHT": //right-top
        dx++;
        dy--;
        break;
      case "MOVE_DOWN_LEFT": //left-bottom
        dx--;
        dy++;
        break;
      case "MOVE_DOWN_RIGHT": //right-bottom
        dx++;
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
    const handleDoors = async (owner: Actor, withDirection: boolean) => {
      //look around and sum how many doors are there. If only one, open it.
      //not cleanest code /o\
      const doors = [];
      const door1 = game.map?.findDoor(owner.x - 1, owner.y);
      const door2 = game.map?.findDoor(owner.x + 1, owner.y);
      const door3 = game.map?.findDoor(owner.x, owner.y - 1);
      const door4 = game.map?.findDoor(owner.x, owner.y + 1);
      const door5 = game.map?.findDoor(owner.x - 1, owner.y - 1);
      const door6 = game.map?.findDoor(owner.x + 1, owner.y - 1);
      const door7 = game.map?.findDoor(owner.x - 1, owner.y + 1);
      const door8 = game.map?.findDoor(owner.x + 1, owner.y + 1);

      if (door1) doors.push(door1);
      if (door2) doors.push(door2);
      if (door3) doors.push(door3);
      if (door4) doors.push(door4);
      if (door5) doors.push(door5);
      if (door6) doors.push(door6);
      if (door7) doors.push(door7);
      if (door8) doors.push(door8);

      if (doors.length === 1 && withDirection === false) {
        doors[0].doorOpenOrClose();
      } else if (doors.length > 0) {
        //if there is more than one door
        game.log.add("Which direction?");
        game.render();

        const [dx, dy] = await this.pickDirection();

        if (!game?.map?.openCloseDoor(owner.x + dx, owner.y + dy)) {
          game.log.add("There is no any door.");
        }
      }
    };

    const findAllContainers = (x: number, y: number): Actor[] | undefined => {
      const containers = [];
      const container1 = game.map?.findContainer(x - 1, y);
      const container2 = game.map?.findContainer(x + 1, y);
      const container3 = game.map?.findContainer(x, y - 1);
      const container4 = game.map?.findContainer(x, y + 1);
      const container5 = game.map?.findContainer(x - 1, y - 1);
      const container6 = game.map?.findContainer(x + 1, y - 1);
      const container7 = game.map?.findContainer(x - 1, y + 1);
      const container8 = game.map?.findContainer(x + 1, y + 1);

      if (container1) containers.push(container1);
      if (container2) containers.push(container2);
      if (container3) containers.push(container3);
      if (container4) containers.push(container4);
      if (container5) containers.push(container5);
      if (container6) containers.push(container6);
      if (container7) containers.push(container7);
      if (container8) containers.push(container8);
      return containers;
    };

    const handleContainers = async (owner: Actor, withDirection: boolean) => {
      //look around and sum how many containers are there. If only one, open it.
      //not cleanest code /o\
      const containers = findAllContainers(owner.x, owner.y);

      if (containers && containers.length === 1 && withDirection === false) {
        await containers[0].openAsContainer(owner);
      } else if (containers && containers.length > 0) {
        //if there is more than one container
        game.log.add("Which direction?");
        game.render();

        const [dx, dy] = await this.pickDirection();

        if (
          !(await game?.map?.openContainer(owner, owner.x + dx, owner.y + dy))
        ) {
          game.log.add("There is no any container.");
        }
      }
    };

    const handleOpen = async (withDirection: boolean) => {
      await handleDoors(owner, withDirection);
      game.player?.computeFov();
      game.gameStatus = GameStatus.NEW_TURN;
    };

    const handleLook = async (withDirection: boolean) => {
      await handleContainers(owner, withDirection);
      game.player?.computeFov();
      game.gameStatus = GameStatus.NEW_TURN;
    };

    // const handleSave = async () => {
    //   game.save();
    //   game.log.add("Game saved.", Colors.GAME_SAVED);
    // };

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
        //game.log.add(`You wield the ${wieldedItem.name}`, Colors.PICKED_UP);
        await ensure(wieldedItem.pickable).wear(wieldedItem, owner);
        game.gameStatus = GameStatus.NEW_TURN;
      } else {
        game.log.add("Nevermind...");
      }
    };

    const handleShooting = async () => {
      //if enemies are too close, cant shoot
      const closestMonster = game.getClosestMonster(owner.x, owner.y, 2);
      if (closestMonster) {
        game.log.add("Can't shoot in melee combat.");
        return;
      }

      //lets find out if any bow/shooting weapon is equipped
      const rangeWeapon = owner.equipments?.getRangeWeapon();
      if (rangeWeapon) {
        if (rangeWeapon.weapon?.needReload && !rangeWeapon.weapon.isReloaded) {
          rangeWeapon.weapon.isReloaded = true;
          game.log.add(`Reloading ${rangeWeapon.name}...`);
          game.gameStatus = GameStatus.NEW_TURN;
          return;
        }

        //if it, pick target tile
        const [isOnRange, tileX, tileY] = await game.pickATile(
          owner.x,
          owner.y,
          rangeWeapon.weapon?.rangeMax,
        );

        ensure(rangeWeapon.weapon).isReloaded = false;

        if (isOnRange) {
          await owner.attacker?.rangeAttack(
            owner,
            tileX as number,
            tileY as number,
          );
          game.gameStatus = GameStatus.NEW_TURN;
        }
      } else {
        game.log.add("Shooting requires a ranged weapon.");
      }
    };

    //this feature is disabled for now

    const handleFov = () => {
      //game.player?.fov?.showAll();
      //game.saveImage();
    };

    const handleHelpInfo = async () => {
      game.renderMenuBackground({
        title: "HELP",
        x: 15,
        y: 4,
        w: 45,
        h: 30,
      });

      game.drawText(
        "WASD+QEZC keys to move and attack",
        17,
        6,
        Colors.DEFAULT_TEXT,
      );

      const bindings = keyBindingsForHelp();
      for (let i = 0; i < bindings.length; i++) {
        const { keys, description } = bindings[i];
        game.drawText(keys.join(" / "), 17, 7 + i, Colors.DEFAULT_TEXT);
        game.drawText(`: ${description}`, 19, 7 + i, Colors.DEFAULT_TEXT);
      }

      await game.getch();
    };

    const handlePush = async () => {
      game.log.add("Which direction to push?");
      game.render();

      const [dx, dy] = await this.pickDirection();

      if (!game?.map?.pushTo(owner.x + dx, owner.y + dy, dx, dy)) {
        game.log.add("There's nothing to push.");
      }

      game.player?.computeFov();
      game.camera.compute(ensure(game.player?.x), ensure(game.player?.y));
      game.gameStatus = GameStatus.NEW_TURN;
    };

    const handlePull = async () => {
      game.log.add("Which direction to pull?");
      game.render();

      const [dx, dy] = await this.pickDirection();

      if (!game?.map?.pullTo(owner.x, owner.y, dx, dy)) {
        game.log.add("There's nothing to pull.");
      } else {
        owner.x += dx;
        owner.y += dy;
      }

      game.player?.computeFov();
      game.camera.compute(ensure(game.player?.x), ensure(game.player?.y));
      game.gameStatus = GameStatus.NEW_TURN;
    };

    //this is for testing purpose only
    const handleSpells = async () => {
      const spells = [
        "acid splash",
        "cure wounds",
        "magic missile",
        "fire bolt",
        "poison spray",
        "thunderwave",
        "fireball",
        "sacred flame",
        "shatter",
        "misty step",
      ];

      game.renderMenuBackground({
        title: "test spells",
        x: 20,
        y: 4,
        w: 20,
        h: 4 + spells.length,
      });

      let shortcut = "a";

      for (let i = 0; i < spells.length; i++) {
        game.drawText(
          `${shortcut}) ${spells[i]}`,
          22,
          6 + i,
          Colors.DEFAULT_TEXT,
        );
        shortcut = String.fromCharCode(shortcut.charCodeAt(0) + 1);
      }

      const ch = await game.getch();
      const spellIndex = ch.charCodeAt(0) - 97; //97 = a

      if (spellIndex < 0 || spellIndex >= spells.length) {
        game.log.add("Nevermind");
      } else {
        game.log.add(`Selected spell: ${spells[spellIndex]}`);
        const spell = getSpell(spells[spellIndex]);

        if (spell) await createSpell(spell, owner, 1);
      }
    };

    const handleZoom = (direction: number) => {
      const v = game.fontSize + direction;
      if (v > 5) {
        game.setScale(v);
        game.render();
      }
    };

    const handleRest = () => {
      game.gameStatus = GameStatus.NEW_TURN;
    };

    switch (keyPress("game", ascii)) {
      case "GO_DOWN":
        handleNextLevel();
        break;

      case "PICK":
        handlePickup();
        break;

      case "INVENTORY":
        await handleUseItem();
        break;

      case "DROP":
        await handleDropItem();
        break;


      case "OPEN_DOORS":
        await handleOpen(false);
        break;
      case "OPEN_DOOR":
        await handleOpen(true);
        break;

      case "WEAR_EQUIP":
        await handleWield();
        break;

      case "AIM":
        await handleShooting();
        break;

      case "HELP":
        await handleHelpInfo();
        break;

      case "PUSH":
        await handlePush();
        break;

      case "PULL":
        await handlePull();
        break;

      case "SPELL":
        await handleSpells();
        break;

      case "ZOOM_OUT":
        handleZoom(-1);
        break;
      case "ZOOM_IN":
        handleZoom(1);
        break;
      case "REST":
        handleRest();
        break;

      
      case "FOV":
        handleFov();
        break;

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
    if (owner.container && owner.equipments) {
      owner.container.render("INVENTORY");
      owner.equipments?.render();
    }

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
  actionPoints: number;
  readonly TRACKING_TURNS: number = 3;

  constructor() {
    super();
    this.moveCount = 0;
    this.actionPoints = 0;
    this.movingSpeed = 1.5;
  }

  async update(owner: Actor, playerSpeed: number) {
    this.actionPoints += (1.0 / playerSpeed) * this.movingSpeed;

    while (this.actionPoints >= 1) {
      const player = game.player;

      if ((owner.destructible && owner.destructible.isDead()) || !player)
        return;

      if (game.player?.fov?.isInFov(owner.x, owner.y)) {
        this.moveCount = this.TRACKING_TURNS;
      } else {
        this.moveCount--;
      }

      if (this.moveCount > 0) {
        this.moveOrAttack(owner, player.x, player.y);
      }
      this.actionPoints -= 1;
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
