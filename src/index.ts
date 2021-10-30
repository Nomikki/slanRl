import { ABILITIES, Abilities } from "./abilities";
import Actor from "./actor";
import { MonsterAI, PlayerAI } from "./ai";
import Attacker from "./attacker";
import { Colors } from "./colors";
import Container from "./container";
import { MonsterDestructible, PlayerDestructible } from "./destructible";
import Fov from "./fov";
import Log from "./log";
import Map from "./map";
import { Menu, MenuItemCode } from "./menu";
import { debugInit, ensure, float2int } from "./utils";

export enum GameStatus {
  STARTUP,
  IDLE,
  NEW_TURN,
  VICTORY,
  DEFEAT,
}

class Game {
  gameStatus: number = GameStatus.STARTUP;
  player?: Actor;
  map?: Map;
  stairs?: Actor;
  canvas: HTMLElement;
  ctx: any;
  fontSize: number;
  log: Log;

  lastKey: string;
  depth: number;
  width: number;
  height: number;

  actors: Actor[];
  masterSeed = 0;

  menu?: Menu;

  turns = 0;

  constructor() {
    this.canvas = document.getElementById("screen")!;

    this.ctx = (this.canvas as HTMLCanvasElement).getContext("2d");
    this.ctx.font = "12px system-ui";
    this.fontSize = 12;
    this.ctx.textAlign = "center";

    this.log = new Log();

    this.lastKey = "";
    this.depth = 0;
    this.turns = 0;

    this.width = 80;
    this.height = 40;

    this.actors = [];
    this.map = new Map(this.width, this.height);
  }

  async term() {
    this.log = new Log();
    this.actors = [];
    this.map = new Map(this.width, this.height);
    this.player = undefined;
  }

  async init(withActors: boolean, createPlayer = true) {
    ensure(this.map).generate(withActors, this.masterSeed, this.depth);

    if (withActors) {
      let i = 0;
      if (createPlayer) {
        i = this.actors.push(new Actor(2, 2, "@", "hero", Colors.HERO)) - 1;
        this.player = this.actors[i];
        this.player.destructible = new PlayerDestructible(
          30,
          2,
          "your cadaver",
        );
        this.player.attacker = new Attacker(5);
        this.player.ai = new PlayerAI();
        this.player.abilities = new Abilities(18, 15, 10, 8, 12);
        this.player.container = new Container(26);
        this.player.fov = new Fov(this.width, this.height);
      }

      ensure(this.player).x = ensure(this.map).startX;
      ensure(this.player).y = ensure(this.map).startY;
      ensure(this.player).fov?.fullClear();

      i = this.actors.push(new Actor(0, 0, ">", "stairs", Colors.STAIRS)) - 1;
      this.stairs = this.actors[i];
      this.stairs.blocks = false;
      this.stairs.fovOnly = false;
      this.stairs.x = ensure(this.map).stairsX;
      this.stairs.y = ensure(this.map).stairsY;
      this.sendToBack(this.stairs);

      this.log.add("Welcome stranger!");
    } else {
      this.log.add("Welcome back stranger!");
    }

    this.gameStatus = GameStatus.STARTUP;
  }

  async nextLevel() {
    this.depth++;
    this.log.add("You take steps down.");

    this.map = undefined;
    this.stairs = undefined;

    const tempPlayer = this.player as Actor;
    this.actors = Array<Actor>();
    this.map = new Map(this.width, this.height);
    this.init(true, false);
    this.actors.push(tempPlayer);

    this.save();
  }

  async newGame() {
    this.masterSeed = float2int(Math.random() * 0x7ffffff);
    //this.masterSeed = 125660641;
    this.turns = 0;
    this.depth = 1;
    await this.term();
    await this.init(true, true);
    await this.save();
  }

  async continueGame() {
    if (window.localStorage.getItem("seed") !== null) {
      const savedVersion = window.localStorage.getItem("version");
      if (savedVersion === null)
        window.localStorage.setItem("version", VERSION);

      this.masterSeed = parseInt(window.localStorage.getItem("seed")!);
      this.depth = parseInt(window.localStorage.getItem("depth")!);
      this.turns = parseInt(window.localStorage.getItem("turns")!);
      await this.init(false);

      const tempUsers = JSON.parse(
        window.localStorage.getItem("actors") || "[]",
      );

      for (const actor of tempUsers) {
        const i =
          this.actors.push(
            new Actor(actor.x, actor.y, actor.ch, actor.name, actor.color),
          ) - 1;

        //this.actors[i].ai = undefined;

        if (actor.fov) {
          this.actors[i].fov = new Fov(this.width, this.height);
          ensure(this.actors[i].fov).mapped = actor.fov.mapped;
        }

        if (actor.container) {
          this.actors[i].container = await new Container(26);

          for (const it of actor.container.inventory) {
            const k =
              ensure(this.actors[i].container).inventory.push(
                new Actor(it.x, it.y, it.ch, it.name, it.color),
              ) - 1;
            ensure(this.actors[i].container).inventory[k].create(it);
          }
        }

        if (actor.abilities) {
          const abi = actor.abilities;
          this.actors[i].abilities = new Abilities(
            abi.str,
            abi.dex,
            abi.con,
            abi.int,
            abi.wis,
          );
        }

        if (actor.attacker) {
          this.actors[i].attacker = new Attacker(actor.attacker.power);
        }

        if (actor.pickable) {
          this.actors[i].create(actor);
        }

        if (actor.name === "stairs") {
          this.stairs = this.actors[i];
        }

        if (actor.name === "door") {
          /*
          this.actors[i].destructible = new Destructible(
            100,
            0,
            "broken door",
            "door",
            0,
          );
          */
          this.actors[i].blocks = actor.blocks;
        }

        if (actor.destructible) {
          if (actor.destructible.type === "player") {
            this.player = this.actors[i];
            this.actors[i].destructible = new PlayerDestructible(
              30,
              2,
              "player corpse",
            );

            this.actors[i].ai = new PlayerAI();
            ensure(this.actors[i].destructible).xp = actor.destructible.xp;
            ensure(this.actors[i].destructible).hp = actor.destructible.hp;
            ensure(this.actors[i].destructible).maxHP =
              actor.destructible.maxHP;
            ensure(this.actors[i].destructible).defense =
              actor.destructible.defense;
            ensure(this.actors[i].destructible).corpseName =
              actor.destructible.corpseName;
          }
          if (actor.destructible.type === "monster") {
            this.actors[i].destructible = new MonsterDestructible(
              1,
              1,
              "monster corpse",
              0,
            );

            ensure(this.actors[i].destructible).xp = actor.destructible.xp;
            ensure(this.actors[i].destructible).hp = actor.destructible.hp;
            ensure(this.actors[i].destructible).maxHP =
              actor.destructible.maxHP;
            ensure(this.actors[i].destructible).defense =
              actor.destructible.defense;
            ensure(this.actors[i].destructible).corpseName =
              actor.destructible.corpseName;

            this.actors[i].ai = new MonsterAI();
          }
        }
      }
    }
  }

  async load() {
    if (window.localStorage.getItem("version") !== VERSION)
      window.localStorage.clear();
    this.menu = new Menu();
    this.menu.clear();
    if (window.localStorage.getItem("depth"))
      this.menu.addItem(MenuItemCode.CONTINUE, "Continue");
    this.menu.addItem(MenuItemCode.NEW_GAME, "New Game");

    let cursor = 0;
    let selectedItem = -1;
    while (true) {
      this.clear();
      this.drawChar(">", this.width / 2 - 12, 10 + cursor, Colors.MENU_CURSOR);
      for (let i = 0; i < this.menu.items.length; i++) {
        this.drawText(this.menu.items[i].label, this.width / 2 - 10, 10 + i);
      }

      const ch = await this.getch();
      if (ch === "ArrowDown") cursor++;
      if (ch === "ArrowUp") cursor--;
      if (ch === "Enter") {
        selectedItem = this.menu.items[cursor].code;
        break;
      }

      cursor = cursor % this.menu.items.length;
      if (cursor < 0) cursor = this.menu.items.length - 1;
    }

    if (selectedItem != -1) {
      if (selectedItem === MenuItemCode.NEW_GAME) {
        await this.newGame();
      }

      if (selectedItem === MenuItemCode.CONTINUE) {
        await this.continueGame();
      }
    }
  }

  async save() {
    const pl = ensure(this.player);

    if (ensure(pl.destructible).isDead()) {
      window.localStorage.clear();
    } else {
      ensure(this.map).save();
      window.localStorage.setItem(
        "playerID",
        this.actors.indexOf(pl).toString(),
      );
      window.localStorage.setItem("turns", this.turns.toString());
      window.localStorage.setItem("actors", JSON.stringify(this.actors));
      window.localStorage.setItem("version", VERSION);
    }
  }

  clear(color = Colors.BACKGROUND) {
    //Game
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      0,
      0,
      this.width * this.fontSize,
      this.height * this.fontSize,
    );

    //"UI"
    this.ctx.fillRect(
      0,
      this.height * this.fontSize,
      this.width * this.fontSize,
      (this.canvas as HTMLCanvasElement).height - this.height * this.fontSize,
    );
  }

  drawChar(ch: string, x: number, y: number, color = Colors.BACKGROUND) {
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = Colors.BACKGROUND;
    this.ctx.fillRect(
      x * this.fontSize - this.fontSize / 2,
      y * this.fontSize,
      this.fontSize,
      this.fontSize,
    );

    this.ctx.fillStyle = color;
    this.ctx.fillText(ch, x * this.fontSize, y * this.fontSize + this.fontSize);
  }

  drawText(text: string, x: number, y: number, color = Colors.DEFAULT_TEXT) {
    this.ctx.textAlign = "left";

    this.ctx.fillStyle = Colors.BACKGROUND;
    this.ctx.fillStyle = color;
    this.ctx.fillText(
      text,
      x * this.fontSize,
      y * this.fontSize + this.fontSize,
    );
  }

  async run() {
    debugInit();

    while (true) {
      await this.load();
      await this.gameloop();
      await this.save();
      this.log.add("Press Esc to restart");
      this.render();
      while (true) {
        const ch = await this.getch();
        if (ch === "Escape") break;
      }
    }
  }

  waitingKeypress() {
    return new Promise<void>(resolve => {
      document.addEventListener("keydown", onKeyHandler);
      function onKeyHandler(e: KeyboardEvent) {
        e.preventDefault();
        if (e.keyCode !== 0) {
          document.removeEventListener("keydown", onKeyHandler);
          game.lastKey = e.key;
          resolve();
        }
      }
    });
  }

  //wait keypress and return key
  async getch() {
    await this.waitingKeypress();
    const tempKey = this.lastKey;
    this.lastKey = "";
    return tempKey;
  }

  render() {
    this.clear();
    ensure(this.map).render();
    for (let i = 0; i < this.actors.length; i++) this.actors[i].render();
    this.renderUI();
  }

  renderUI() {
    for (let x = 0; x < this.width; x++) {
      this.drawChar("-", x, this.height, Colors.MENU_BORDER);
    }

    const pl = ensure(this.player);

    const hp = ensure(pl.destructible?.hp);
    const ac = pl.destructible?.defense;
    const power = pl.attacker?.power;
    const maxHP = ensure(pl.destructible?.maxHP);
    const depth = ensure(this.map).depth;
    const turn = ensure(this.turns);
    const xp = pl.destructible?.xp;

    const getHpColor = (): string => {
      if (hp < (maxHP / 100) * 10) return Colors.HP_10_PERCENT;
      else if (hp < (maxHP / 100) * 25) return Colors.HP_25_PERCENT;
      else if (hp < (maxHP / 100) * 50) return Colors.HP_50_PERCENT;
      else if (hp < (maxHP / 100) * 95) return Colors.HP_95_PERENT;

      return Colors.HP_MAX;
    };

    this.drawText("HP: " + hp + "/" + maxHP, 1, this.height + 1, getHpColor());
    this.drawText("ATT: " + power, 7, this.height + 1);
    this.drawText("AC: " + ac, 11, this.height + 1);

    this.drawText("Depth: " + depth, this.width - 6, this.height + 1);
    this.drawText("Turn: " + turn, this.width - 6, this.height + 2);

    this.drawText(
      "EXP: " + xp + " / " + (pl.ai as PlayerAI)?.getNextLevelXP(),
      1,
      this.height + 2,
    );

    const padding = 8;
    const offset = 17;

    const abi = this.player?.abilities;

    this.drawText(
      `STR: ${abi?.str} (${abi?.getBonusWithSign(ABILITIES.STR)})`,
      offset,
      this.height + 1,
    );

    this.drawText(
      `DEX: ${abi?.dex} (${abi?.getBonusWithSign(ABILITIES.DEX)})`,
      offset + padding,
      this.height + 1,
    );

    this.drawText(
      `CON: ${abi?.con} (${abi?.getBonusWithSign(ABILITIES.CON)})`,
      offset + padding * 2,
      this.height + 1,
    );
    this.drawText(
      `INT: ${abi?.int} (${abi?.getBonusWithSign(ABILITIES.INT)})`,
      offset + padding * 3,
      this.height + 1,
    );
    this.drawText(
      `WIS: ${abi?.wis} (${abi?.getBonusWithSign(ABILITIES.WIS)})`,
      offset + padding * 4,
      this.height + 1,
    );

    this.log.render();
  }

  async gameloop() {
    while (true) {
      if (this.gameStatus === GameStatus.STARTUP) {
        this.player?.computeFov();
        this.render();
      }
      this.gameStatus = GameStatus.IDLE;

      await this.player?.update();

      if (this.gameStatus === GameStatus.NEW_TURN) {
        for (const actor of this.actors) {
          if (actor !== this.player) {
            await actor.update();
          }
        }
        this.turns++;
      }

      //finally draw screen

      this.render();

      if (this.gameStatus === GameStatus.DEFEAT) {
        this.drawText(
          "DEFEAT!",
          this.width / 2 - 3,
          this.height / 2,
          Colors.DEFEAT,
        );
        this.log.add("DEFEAT", Colors.DEFEAT);
        break;
      }
    }
  }

  removeActor(actor: Actor) {
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i] === actor) {
        this.actors.splice(i, 1);
        return;
      }
    }
  }

  sendToBack(actor: Actor) {
    this.removeActor(actor);
    this.actors.unshift(actor);
  }

  getClosestMonster(x: number, y: number, range: number) {
    let closest = null;
    let bestDistance = 100000;

    for (const actor of this.actors) {
      if (
        actor != this.player &&
        actor.destructible &&
        !actor.destructible.isDead()
      ) {
        const distance = actor.getDistance(x, y);
        if (distance < bestDistance && (distance <= range || range == 0.0)) {
          bestDistance = distance;
          closest = actor;
        }
      }
    }
    return closest;
  }

  getActor(x: number, y: number): any {
    for (const actor of this.actors) {
      if (
        actor.x === x &&
        actor.y === y &&
        actor.destructible &&
        !actor.destructible.isDead()
      ) {
        return actor;
      }
    }
    return null;
  }

  getAnyActor(x: number, y: number): any {
    for (const actor of this.actors) {
      if (actor.x === x && actor.y === y) {
        return actor;
      }
    }
    return null;
  }

  async pickATile(x: number, y: number, range = 0.0) {
    let px = x;
    let py = y;
    let inRange = false;

    while (true) {
      this.render();
      if (
        this.player?.fov?.isInFov(px, py) &&
        (range == 0 || this.player.getDistance(px, py) <= range)
      ) {
        this.drawChar("+", px, py, Colors.ALLOWED);
        inRange = true;
      } else {
        this.drawChar("+", px, py, Colors.DISALLOWED);
        inRange = false;
      }

      const ch = await this.getch();
      if (ch === "ArrowLeft") px--;
      if (ch === "ArrowRight") px++;
      if (ch === "ArrowUp") py--;
      if (ch === "ArrowDown") py++;
      if (ch === "Escape") break;
      if (ch === "Enter") {
        if (inRange) {
          return [true, px, py];
        }
      }
    }

    return [false, px, py];
  }
}

export const game = new Game();

game.run();
