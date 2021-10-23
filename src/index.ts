import Actor from "./actor";
import { MonsterAI, PlayerAI } from "./ai";
import Attacker from "./attacker";
import Container from "./container";
import { MonsterDestructible, PlayerDestructible } from "./destructible";
import Fov from "./fov";
import Log from "./log";
import Map from "./map";
import { Menu, MenuItemCode } from "./menu";
import { debugInit, ensure } from "./utils";

export enum GameStatus {
  STARTUP,
  IDLE,
  NEW_TURN,
  VICTORY,
  DEFEAT,
}

export type Tile = [boolean, number, number];

class Game {
  actors: Actor[] = [];
  canvas: HTMLElement = ensure(document.getElementById("screen"));
  ctx: CanvasRenderingContext2D = ensure(
    (this.canvas as HTMLCanvasElement).getContext("2d"),
  );
  depth = 0;
  fontSize = 12;
  gameStatus = 0;
  height = 40;
  lastKey = "";
  log: Log = new Log();
  map?: Map;
  masterSeed = 0;
  menu?: Menu;
  player?: Actor;
  playerX?: number;
  playerY?: number;
  stairs?: Actor;
  width = 80;

  constructor() {
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";

    this.map = new Map(this.width, this.height);
  }

  async term() {
    this.log = new Log();
    this.actors = [];
    this.map = new Map(this.width, this.height);
    this.player = undefined;
  }

  async init(withActors: boolean, createPlayer = true) {
    if (!this.map) {
      return;
    }

    this.map.generate(withActors, this.masterSeed, this.depth);

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

      if (!this.player) {
        return;
      }

      this.player.x = this.map.startX;
      this.player.y = this.map.startY;
      this.player.fov?.fullClear();

      i = this.actors.push(new Actor(0, 0, ">", "stairs", "#FFF")) - 1;
      this.stairs = this.actors[i];
      this.stairs.blocks = false;
      this.stairs.fovOnly = false;
      this.stairs.x = this.map.stairsX;
      this.stairs.y = this.map.stairsY;

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

    const tempPlayer = ensure(this.player);
    this.actors = [];
    this.map = new Map(this.width, this.height);
    this.init(true, false);
    this.actors.push(tempPlayer);

    this.save();
  }

  async newGame() {
    this.masterSeed = (Math.random() * 0x7ffffff) | 0;

    this.depth = 1;
    await this.term();
    await this.init(true, true);
    await this.save();
  }

  async continueGame() {
    const seed = window.localStorage.getItem("seed");
    if (seed !== null) {
      const savedVersion = window.localStorage.getItem("version");
      if (savedVersion === null)
        window.localStorage.setItem("version", VERSION);

      const depth = window.localStorage.getItem("depth");

      this.masterSeed = parseInt(seed, 10);
      this.depth = depth ? parseInt(depth, 10) : 0;

      await this.init(false);

      const tempUsers = JSON.parse(
        window.localStorage.getItem("actors") || "[]",
      );

      for (const actor of tempUsers) {
        const i =
          this.actors.push(
            new Actor(actor.x, actor.y, actor.ch, actor.name, actor.color),
          ) - 1;

        const thisActor = this.actors[i];

        thisActor.ai = undefined;

        if (actor.fov) {
          thisActor.fov = new Fov(this.width, this.height);
          thisActor.fov.mapped = actor.fov.mapped;
        }

        if (actor.container) {
          thisActor.container = await new Container(26);

          for (const it of actor.container.inventory) {
            const k =
              thisActor.container.inventory.push(
                new Actor(it.x, it.y, it.ch, it.name, it.color),
              ) - 1;
            thisActor.container.inventory[k].create(it);
          }
        }

        if (actor.attacker) {
          thisActor.attacker = new Attacker(actor.attacker.power);
        }

        if (actor.pickable) {
          thisActor.create(actor);
        }

        if (actor.name === "stairs") {
          this.stairs = thisActor;
        }

        if (actor.destructible) {
          if (actor.destructible.type === "player") {
            this.player = thisActor;
            thisActor.destructible = new PlayerDestructible(
              30,
              2,
              "player corpse",
            );

            thisActor.ai = new PlayerAI();

            thisActor.destructible.hp = actor.destructible.hp;
            thisActor.destructible.maxHP = actor.destructible.maxHP;
            thisActor.destructible.defense = actor.destructible.defense;
            thisActor.destructible.corpseName = actor.destructible.corpseName;
          }
          if (actor.destructible.type === "monster") {
            thisActor.destructible = new MonsterDestructible(
              1,
              1,
              "monster corpse",
            );

            thisActor.destructible.hp = actor.destructible.hp;
            thisActor.destructible.maxHP = actor.destructible.maxHP;
            thisActor.destructible.defense = actor.destructible.defense;
            thisActor.destructible.corpseName = actor.destructible.corpseName;

            thisActor.ai = new MonsterAI();
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

    //this.menu.addItem(MenuItemCode.EXIT, "Exit");

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
    const player = ensure(this.player);
    const map = ensure(this.map);
    if (player.destructible?.isDead()) {
      window.localStorage.clear();
    } else {
      map.save();
      window.localStorage.setItem("playerID", `${this.actors.indexOf(player)}`);
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

    this.map?.render();
    if (this.playerX && this.playerY) {
      this.drawChar("@", this.playerX, this.playerY, "#AAA");
    }

    for (let i = 0; i < this.actors.length; i++) this.actors[i].render();

    this.renderUI();
  }

  renderUI() {
    for (let x = 0; x < this.width; x++) {
      this.drawChar("-", x, this.height, "#888");
    }

    const player = this.player;
    const map = this.map;

    const hp = player?.destructible?.hp;
    const maxHP = player?.destructible?.maxHP;
    const depth = map?.depth;
    this.drawText(`HP: ${hp}/${maxHP}`, 1, this.height + 1);
    this.drawText(`Depth: ${depth}`, this.width - 6, this.height + 1);

    if (!player?.ai?.type) {
      return;
    }

    if (player.ai?.type === "player") {
      this.drawText(
        `EXP: ${player.destructible?.xp} / ${player.ai.getNextLevelXP()}`,
        10,
        this.height + 1,
      );
    }

    this.log.render();
  }

  async gameloop() {
    const player = ensure(this.player);
    while (true) {
      if (this.gameStatus === GameStatus.STARTUP) {
        player.computeFov();
        this.render();
      }
      this.gameStatus = GameStatus.IDLE;

      await player.update();

      if (this.gameStatus === GameStatus.NEW_TURN) {
        for (const actor of this.actors) {
          if (actor !== player) {
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

  getActor(x: number, y: number) {
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

  async pickATile(x: number, y: number, range = 0.0): Promise<Tile> {
    let px = x;
    let py = y;
    let inRange = false;

    while (true) {
      this.render();
      if (
        this.player?.fov?.isInFov(px, py) &&
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
