import Actor from "./actor";
import { MonsterAI, PlayerAI } from "./ai";
import Attacker from "./attacker";
import Container from "./container";
import { MonsterDestructible, PlayerDestructible } from "./destructible";
import Fov from "./fov";
import Log from "./log";
import Map from "./map";
//import { Confuser, Fireball, Healer, LightningBolt } from "./pickable";
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

  constructor() {
    this.canvas = document.getElementById("screen")!;

    this.ctx = (this.canvas as HTMLCanvasElement).getContext("2d");
    this.ctx.font = "12px Arial";
    this.fontSize = 12;
    this.ctx.textAlign = "center";

    this.log = new Log();

    this.lastKey = "";
    this.depth = 0;

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
        i = this.actors.push(new Actor(2, 2, "@", "hero", "#CCC")) - 1;
        this.player = this.actors[i];
        this.player.destructible = new PlayerDestructible(
          30,
          2,
          "your cadaver",
        );
        this.player.attacker = new Attacker(5);
        this.player.ai = new PlayerAI();
        this.player.container = new Container(26);
        this.player.fov = new Fov(this.width, this.height);
      }

      ensure(this.player).x = ensure(this.map).startX;
      ensure(this.player).y = ensure(this.map).startY;
      ensure(this.player).fov.fullClear();

      i = this.actors.push(new Actor(0, 0, ">", "stairs", "#FFF")) - 1;
      this.stairs = this.actors[i];
      this.stairs.blocks = false;
      this.stairs.fovOnly = false;
      this.stairs.x = ensure(this.map).stairsX;
      this.stairs.y = ensure(this.map).stairsY;

      this.log.add("Welcome stranger!", "#FFF");
    } else {
      this.log.add("Welcome back stranger!", "#FFF");
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
          this.actors[i].fov.mapped = actor.fov.mapped;
        }

        if (actor.container) {
          this.actors[i].container = await new Container(26);

          for (const it of actor.container.inventory) {
            const k =
              this.actors[i].container.inventory.push(
                new Actor(it.x, it.y, it.ch, it.name, it.color),
              ) - 1;
            this.actors[i].container.inventory[k].create(it);
          }
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

        if (actor.destructible) {
          if (actor.destructible.type === "player") {
            this.player = this.actors[i];
            this.actors[i].destructible = new PlayerDestructible(
              30,
              2,
              "player corpse",
            );

            this.actors[i].ai = new PlayerAI();
            this.actors[i].destructible.xp = actor.destructible.xp;
            this.actors[i].destructible.hp = actor.destructible.hp;
            this.actors[i].destructible.maxHP = actor.destructible.maxHP;
            this.actors[i].destructible.defense = actor.destructible.defense;
            this.actors[i].destructible.corpseName =
              actor.destructible.corpseName;
          }
          if (actor.destructible.type === "monster") {
            this.actors[i].destructible = new MonsterDestructible(
              1,
              1,
              "monster corpse",
              0,
            );

            this.actors[i].destructible.xp = actor.destructible.xp;
            this.actors[i].destructible.hp = actor.destructible.hp;
            this.actors[i].destructible.maxHP = actor.destructible.maxHP;
            this.actors[i].destructible.defense = actor.destructible.defense;
            this.actors[i].destructible.corpseName =
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
      this.drawChar(">", this.width / 2 - 12, 10 + cursor, "#FFF");
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

    if (pl.destructible.isDead()) {
      window.localStorage.clear();
    } else {
      ensure(this.map).save();
      window.localStorage.setItem(
        "playerID",
        this.actors.indexOf(pl).toString(),
      );
      window.localStorage.setItem("actors", JSON.stringify(this.actors));
      window.localStorage.setItem("version", VERSION);
    }
  }

  clear(color = "#000") {
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

  drawChar(ch: string, x: number, y: number, color = "#000") {
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#040414";
    this.ctx.fillRect(
      x * this.fontSize - this.fontSize / 2,
      y * this.fontSize,
      this.fontSize,
      this.fontSize,
    );

    this.ctx.fillStyle = color;
    this.ctx.fillText(ch, x * this.fontSize, y * this.fontSize + this.fontSize);
  }

  drawText(text: string, x: number, y: number, color = "#AAA") {
    this.ctx.textAlign = "left";
    /*
    for (let i = 0; i < text.length; i++) {
      this.drawChar(text.charAt(i), x + i, y, color);
    }
    */
    this.ctx.fillStyle = "#040414";
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
      this.log.add("Press Esc to restart", "#FFF");
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
      function onKeyHandler(e: any) {
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

    const pl = ensure(this.player);

    this.drawChar("@", pl.x, pl.y, "#AAA");

    for (let i = 0; i < this.actors.length; i++) this.actors[i].render();

    this.renderUI();
  }

  renderUI() {
    for (let x = 0; x < this.width; x++) {
      this.drawChar("-", x, this.height, "#888");
    }

    const pl = ensure(this.player);

    const hp = pl.destructible.hp;
    const maxHP = pl.destructible.maxHP;
    const depth = ensure(this.map).depth;
    this.drawText("HP: " + hp + "/" + maxHP, 1, this.height + 1);
    this.drawText("Depth: " + depth, this.width - 6, this.height + 1);

    this.drawText(
      "EXP: " +
        pl.destructible.xp +
        " / " +
        (pl.ai as PlayerAI)?.getNextLevelXP(),
      10,
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
      }

      //finally draw screen
      this.render();

      if (this.gameStatus === GameStatus.DEFEAT) {
        this.drawText("DEFEAT!", this.width / 2 - 3, this.height / 2, "#A00");
        this.log.add("DEFEAT", "#A00");
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

  async pickATile(x: number, y: number, range = 0.0) {
    let px = x;
    let py = y;
    let inRange = false;

    while (true) {
      this.render();
      if (
        this.player?.fov.isInFov(px, py) &&
        (range == 0 || this.player.getDistance(px, py) <= range)
      ) {
        this.drawChar("+", px, py, "#FFF");
        inRange = true;
      } else {
        this.drawChar("+", px, py, "#F88");
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
