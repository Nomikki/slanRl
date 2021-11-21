import "@/index.scss";
import Container from "@/items/container";
import Equipments from "@/items/equipments";
import { createItem } from "@/items/itemGenerator";
import Map from "@/map";
import { Camera } from "@/map/camera";
import Fov from "@/map/fov";
import { ABILITIES, Abilities } from "@/rpg/abilities";
import Attacker from "@/rpg/attacker";
import { prepareNewJourney } from "@/rpg/characterCreation";
import Actor from "@/units/actor";
import { MonsterAI, PlayerAI } from "@/units/ai";
import { MonsterDestructible, PlayerDestructible } from "@/units/destructible";
import { capitalize, debugInit, ensure, float2int, rgbToHex } from "@/utils";
import { Colors } from "@/utils/colors";
import Log from "@/utils/log";
import { Menu, MenuItemCode } from "@/utils/menu";
import GitHub from "./github";
import { keyPress } from "./keymappings";
import { getClassNameByIndex } from "./rpg/classes";
import { getRaceNameByIndex } from "./rpg/races";
import { connectSocket } from "./socket";

interface MenuBackgroundProps {
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export enum GameStatus {
  MAINMENU,
  NEWGAME,
  STARTUP,
  IDLE,
  NEW_TURN,
  VICTORY,
  DEFEAT,
}

const gameStatuses = [
  "MAINMENU",
  "NEWGAME",
  "STARTUP",
  "IDLE",
  "NEW TURN",
  "VICTORY",
  "DEFEAT",
];

export class Game {
  gameStatus: number = GameStatus.MAINMENU;
  player?: Actor;
  map?: Map;
  stairs?: Actor;
  canvas: Element;
  ctx: CanvasRenderingContext2D;
  fontSize = 12;
  log: Log;

  lastKey: string;
  depth: number;
  width: number;
  height: number;

  actors: Actor[];
  masterSeed = 0;

  menu?: Menu;

  turns = 0;

  mapx = 80;
  mapy = 80;

  camera: Camera;

  github: typeof GitHub;
  socket? = PRODUCTION ? connectSocket() : undefined;

  constructor() {
    this.canvas = ensure(document.querySelector("#screen"));
    this.ctx = ensure((this.canvas as HTMLCanvasElement).getContext("2d"));

    this.setScale(12);
    this.ctx.textAlign = "center";

    this.log = new Log();

    this.lastKey = "";
    this.depth = 0;
    this.turns = 0;

    this.width = 80;
    this.height = 57;

    this.actors = [];

    this.map = new Map(this.mapx, this.mapy);

    this.camera = new Camera();
    this.camera.setCenter(this.width, this.height);

    const tempImage = ensure(document.querySelector("#temp-image"));
    const zoomTempImage = () => {
      tempImage.classList.toggle("zoomed");
    };

    this.github = GitHub;
    this.github.setGame(this);

    tempImage.addEventListener("click", zoomTempImage);
    window.addEventListener("resize", this.fitCanvasToScreen);

    if (this.socket) this.addSocketEvents();
  }

  getStats() {
    return {
      playername: sessionStorage.getItem("username") || "anonymous",
      gamestatus: this.gameStatus,
      depth: this.depth,
      turns: this.turns,
      seed: this.masterSeed,
    };
  }

  addSocketEvents() {
    interface Score {
      playername: string;
      depth: number;
      turns: number;
      gamestatus: number;
      seed: number;
    }

    const stats = ensure(document.querySelector("#stats"));
    if (this.socket) {
      this.socket
        .on("connect", () => {
          this.github.toggleButtons();
        })
        .on("disconnect", () => {
          this.github.toggleButtons();
          stats.classList.add("hidden");
        })
        .on("error", () => {
          this.github.toggleButtons();
          stats.classList.add("hidden");
        })
        .on("status", () => {
          this.socket?.emit("score", this.getStats());
        })
        .on("stats", data => {
          const { currentPlayers, live, top } = data;

          stats.classList.remove("hidden");
          stats.innerHTML = `Players online: ${currentPlayers}`;

          if (Object.keys(top).length > 0) {
            stats.innerHTML = `${stats.innerHTML}\n----\nTop Scores:\n`;
            Object.keys(top).forEach(key => {
              const { playername, depth, turns, seed }: Score = top[key];
              stats.innerHTML = `${stats.innerHTML} - ${playername}, d: ${depth}, t: ${turns}, seed: ${seed}\n`;
            });
          }

          if (Object.keys(live).length > 0) {
            stats.innerHTML = `${stats.innerHTML}\n----\nLive Scores:\n`;
            Object.keys(live).forEach(key => {
              const { playername, depth, turns, gamestatus, seed }: Score =
                live[key];
              stats.innerHTML = `${stats.innerHTML} - ${playername}, d: ${depth}, t: ${turns}, seed: ${seed}, ${gameStatuses[gamestatus]}\n`;
            });
          }
        });
    }
  }

  setScale(scale: number) {
    this.fontSize = float2int(scale);
    this.ctx.canvas.width = 80 * scale;
    this.ctx.canvas.height = 60 * scale;
  }

  handleZoomKeys(ch: string) {
    if (ch === "ZOOM_IN") {
      this.fontSize++;
      this.setScale(this.fontSize);
    } else if (ch === "ZOOM_OUT") {
      this.fontSize--;
      this.setScale(this.fontSize);
    }
  }

  fitCanvasToScreen() {
    const { width, height } = window.visualViewport;
    const fitRatio = 80 / 60;
    const visualRatio = width / height;

    const minimumWidth = float2int((width / (80 * 12)) * 12);
    const minimumHeight = float2int((height / (60 * 12)) * 12);

    if (game.gameStatus === GameStatus.MAINMENU) {
      game.setScale(visualRatio < fitRatio ? minimumWidth : minimumHeight);
      game.renderStartMenu();
    } else if (game.gameStatus === GameStatus.NEWGAME) {
      //
    } else {
      game.setScale(visualRatio < fitRatio ? minimumWidth : minimumHeight);
      game.render();
    }
  }

  async term() {
    this.log = new Log();
    this.actors = [];
    this.map = new Map(this.mapx, this.mapy);
    this.player = undefined;

    this.ctx = ensure((this.canvas as HTMLCanvasElement).getContext("2d"));
    this.ctx.textAlign = "center";
  }

  async init(withActors: boolean, createPlayer = true) {
    ensure(this.map).generate(withActors, this.masterSeed, this.depth);

    if (withActors) {
      let i = 0;
      if (createPlayer) {
        i =
          this.actors.push(
            new Actor(2, 2, "@", "placeholder hero", Colors.HERO),
          ) - 1;
        this.player = this.actors[i];
        this.player.destructible = new PlayerDestructible(
          30,
          10,
          "your cadaver",
        );
        this.player.attacker = new Attacker("1d4", "1d1");
        this.player.ai = new PlayerAI();
        this.player.abilities = new Abilities(18, 15, 10, 8, 12);
        this.player.container = new Container(26);
        this.player.equipments = new Equipments();
        this.player.fov = new Fov(this.mapx, this.mapy);

        const item = createItem({
          name: "leather armor",
          x: ensure(this.player).x,
          y: ensure(this.player).y,
        });

        const item2 = createItem({
          name: "hide",
          x: ensure(this.player).x,
          y: ensure(this.player).y,
        });

        const item3 = createItem({
          name: "handaxe",
          x: ensure(this.player).x,
          y: ensure(this.player).y,
        });

        const item4 = createItem({
          name: "light crossbow",
          x: ensure(this.player).x,
          y: ensure(this.player).y,
        });

        const item5 = createItem({
          name: "shortbow",
          x: ensure(this.player).x,
          y: ensure(this.player).y,
        });

        const item6 = createItem({
          name: "club",
          x: ensure(this.player).x,
          y: ensure(this.player).y,
        });

        this.player?.container?.add(item);
        this.player?.container?.add(item2);
        this.player?.container?.add(item3);
        this.player?.container?.add(item4);
        this.player?.container?.add(item5);
        this.player?.container?.add(item6);
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
      this.log.add("Need help? Press '?'", Colors.HILIGHT_TEXT);
    } else {
      this.log.add("Welcome back stranger!");
      this.log.add("Need help? Press '?'", Colors.HILIGHT_TEXT);
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
    this.map = new Map(this.mapx, this.mapy);
    this.init(true, false);
    this.actors.push(tempPlayer);

    this.save();
  }

  async newGame() {
    game.gameStatus = GameStatus.NEWGAME;

    this.masterSeed = parseInt(SEED) || float2int(Math.random() * 0x7ffffff);

    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("seed"))
        this.masterSeed = parseInt(ensure(urlParams.get("seed")));
    }

    history.pushState(
      {},
      "Slan Roguelike",
      `${COMMIT_HASH !== "dev" ? "/slanRl" : ""}/?seed=${this.masterSeed}`,
    );

    //choose race, class, abilities and give name
    const [
      abi,
      selRace,
      selClass,
      hpStart,
      hpPerLevel,
      hpIncreasePerLevel,
      name,
    ] = await prepareNewJourney();

    //after everything is setted up
    this.turns = 0;
    this.depth = 1;
    await this.term();
    await this.init(true, true);

    const pl = ensure(this.player);

    pl.abilities = ensure(abi as Abilities);
    pl.race = ensure(selRace as number);
    pl.class = ensure(selClass as number);
    pl.getProfiencies();

    /*
    const raceName = getRaceNameByIndex(selRace as number);
    const className = getClassNameByIndex(selClass as number);
    pl.name = `${name} the ${raceName} ${className}`;
    */
    pl.name = `${name}`;
    const hpBonus = (abi as Abilities).getBonus(ABILITIES.CON) as number;
    const destr = ensure(pl.destructible);
    destr.maxHP = (hpStart as number) + hpBonus;
    destr.hp = destr.maxHP;

    destr.hpPerLevel = hpPerLevel as number;
    destr.hpPerLevelBonuses = hpIncreasePerLevel as number;

    await this.save();
  }

  async continueGame() {
    if (window.localStorage.getItem("seed") !== null) {
      const savedVersion = window.localStorage.getItem("version");
      if (savedVersion === null)
        window.localStorage.setItem("version", VERSION);

      this.masterSeed = parseInt(ensure(window.localStorage.getItem("seed")));
      this.depth = parseInt(ensure(window.localStorage.getItem("depth")));
      this.turns = parseInt(ensure(window.localStorage.getItem("turns")));
      await this.init(false);

      const tempUsers = JSON.parse(
        window.localStorage.getItem("actors") || "[]",
      );

      for (const actor of tempUsers) {
        const i =
          this.actors.push(
            new Actor(actor.x, actor.y, actor.ch, actor.name, actor.color),
          ) - 1;

        if (actor.fov) {
          this.actors[i].fov = new Fov(this.mapx, this.mapy);
          ensure(this.actors[i].fov).mapped = actor.fov.mapped;
        }

        this.actors[i].emitLight = actor.emitLight;

        if (actor.container) {
          this.actors[i].container = await new Container(26);

          for (const it of actor.container.inventory) {
            const k =
              ensure(this.actors[i].container).inventory.push(
                new Actor(it.x, it.y, it.ch, it.name, it.color),
              ) - 1;
            ensure(this.actors[i].container).inventory[k] = createItem({
              name: it.name,
              x: it.x,
              y: it.y,
            });
          }
        }

        if (actor.equipments) {
          this.actors[i].equipments = new Equipments();
          for (const it of actor.equipments.items) {
            ensure(this.actors[i].equipments).add(
              createItem({ name: it.name, x: it.x, y: it.y }),
            );
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
          this.actors[i].attacker = new Attacker(
            actor.attacker.power_melee,
            actor.attacker.power_range,
          );
          ensure(this.actors[i].attacker).rangeAttack_range =
            actor.attacker.rangeAttack_range;
        }

        if (actor.pickable) {
          if (actor.armor || actor.weapon) {
            this.actors[i] = createItem({
              name: actor.name,
              x: actor.x,
              y: actor.y,
            });
          } else {
            this.actors[i].create(actor);
          }
        }

        if (actor.name === "stairs") {
          this.stairs = this.actors[i];
          this.stairs.fovOnly = false;
        }

        if (actor.name === "door") {
          this.actors[i].blocks = actor.blocks;
          this.actors[i].fovOnly = actor.fovOnly;
        }

        if (actor.destructible) {
          if (actor.destructible.type === "player") {
            this.player = this.actors[i];
            this.actors[i].destructible = new PlayerDestructible(
              30,
              10,
              "player corpse",
            );

            this.actors[i].ai = new PlayerAI();

            const destr = ensure(this.actors[i].destructible);
            destr.xp = actor.destructible.xp;
            destr.hpPerLevel = actor.destructible.hpPerLevel;
            destr.hpPerLevelBonuses = actor.destructible.hpPerLevelBonuses;
            destr.hp = actor.destructible.hp;
            destr.maxHP = actor.destructible.maxHP;
            destr.defense = actor.destructible.defense;
            destr.corpseName = actor.destructible.corpseName;
          } else if (actor.destructible.type === "monster") {
            this.actors[i].destructible = new MonsterDestructible(
              1,
              1,
              "monster corpse",
              0,
            );

            const destr = ensure(this.actors[i].destructible);
            destr.xp = actor.destructible.xp;
            destr.hp = actor.destructible.hp;
            destr.maxHP = actor.destructible.maxHP;
            destr.defense = actor.destructible.defense;
            destr.corpseName = actor.destructible.corpseName;

            if (actor.destructible.hp <= 0) this.actors[i].blocks = false;

            this.actors[i].ai = new MonsterAI();
          } else {
            this.actors[i].destructible = new MonsterDestructible(1, 1, "", 0);

            const destr = ensure(this.actors[i].destructible);
            destr.xp = actor.destructible.xp;
            destr.hp = actor.destructible.hp;
            destr.maxHP = actor.destructible.maxHP;
            destr.defense = actor.destructible.defense;
            destr.corpseName = actor.destructible.corpseName;
          }
        }
      }
    }
  }

  renderStartMenu() {
    this.clear();
    this.renderVersion();
    if (this.menu) {
      this.drawChar(
        ">",
        this.width / 2 - 12,
        10 + this.menu.cursor,
        Colors.MENU_CURSOR,
      );
      for (let i = 0; i < this.menu.items.length; i++) {
        this.drawText(this.menu.items[i].label, this.width / 2 - 10, 10 + i);
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

    let selectedItem = -1;
    while (true) {
      this.renderStartMenu();

      const ch = keyPress("menu", await this.getch());
      if (ch === "MOVE_DOWN") this.menu.cursor++;
      if (ch === "MOVE_UP") this.menu.cursor--;
      if (ch === "SELECT") {
        selectedItem = this.menu.items[this.menu.cursor].code;
        break;
      }

      this.handleZoomKeys(ch);

      this.menu.cursor = this.menu.cursor % this.menu.items.length;
      if (this.menu.cursor < 0) this.menu.cursor = this.menu.items.length - 1;
    }

    if (selectedItem != -1) {
      if (selectedItem === MenuItemCode.NEW_GAME) await this.newGame();
      if (selectedItem === MenuItemCode.CONTINUE) await this.continueGame();
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

    if (this.socket && this.socket.connected) {
      this.github.toggleButtons();
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

  saveImage() {
    const tempW = this.width;
    const tempH = this.height;

    const oldCameraX = this.camera.x;
    const oldCameraY = this.camera.y;
    const oldFontSize = this.fontSize;
    this.width = this.mapx;
    this.height = this.mapy;

    const tempImage = ensure(document.querySelector("#temp-image"));
    tempImage.classList.remove("hidden");
    const tempImageCanvas = ensure(
      document.querySelector("#temp-image-canvas"),
    );

    this.canvas = tempImageCanvas;
    this.ctx = ensure((this.canvas as HTMLCanvasElement).getContext("2d"));
    this.setScale(12);
    this.ctx.canvas.width = this.mapx * this.fontSize;
    this.ctx.canvas.height = this.mapy * this.fontSize;

    this.camera.x = 0;
    this.camera.y = 0;

    this.clear();
    ensure(this.map).render();
    for (let i = 0; i < this.actors.length; i++) this.actors[i].render();
    this.renderLighting();

    this.canvas = ensure(document.getElementById("screen"));
    this.ctx = ensure((this.canvas as HTMLCanvasElement).getContext("2d"));

    this.width = tempW;
    this.height = tempH;

    this.camera.x = oldCameraX;
    this.camera.y = oldCameraY;

    this.setScale(oldFontSize);
    this.render();
  }

  drawChar(ch: string, x: number, y: number, color = Colors.BACKGROUND) {
    if (x < 0 || y < 0 || x > this.width || y > this.height) {
      return;
    }

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

  drawRectangle(
    x: number,
    y: number,
    color = Colors.BACKGROUND,
    opacity: number,
  ) {
    if (x < 0 || y < 0 || x > this.width || y > this.height) {
      return;
    }

    let lvalue = opacity.toString(16);
    if (lvalue.length === 0) lvalue = "00";
    if (lvalue.length < 2) lvalue = "0" + lvalue;
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = color + lvalue;
    this.ctx.fillRect(
      x * this.fontSize - this.fontSize / 2,
      y * this.fontSize,
      this.fontSize,
      this.fontSize,
    );

    this.ctx.fillStyle = "#FFFFFFFF";
  }

  drawText(
    text: string,
    x: number,
    y: number,
    color = Colors.DEFAULT_TEXT,
    align = "left",
  ) {
    this.ctx.textAlign = align as CanvasTextAlign;
    this.ctx.font = `${this.fontSize}px system-ui`;
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

    this.fitCanvasToScreen();

    while (true) {
      await this.load();
      await this.gameloop();
      await this.save();
      this.log.add("Press Esc to restart");
      this.render();
      while (true) {
        const ch = keyPress("game", await this.getch());
        if (ch === "ESCAPE") break;
      }
    }
  }

  waitingKeypress() {
    return new Promise<void>(resolve => {
      const onKeyHandler = async (e: KeyboardEvent) => {
        let preventKey = false;
        if (
          (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
          e.keyCode == 83
        ) {
          e.preventDefault();
          e.stopPropagation();
          this.log.add("Game saved.", Colors.GAME_SAVED);
          await this.save();
          preventKey = true;
        }
        if (e.keyCode !== 0 && !preventKey) {
          game.lastKey = e.key;
        }
        document.removeEventListener("keydown", onKeyHandler);
        resolve();
        return;
      };

      document.addEventListener("keydown", onKeyHandler);
    });
  }

  //wait keypress and return key
  async getch() {
    await this.waitingKeypress();
    const tempKey = this.lastKey;
    this.lastKey = "";
    ensure(document.querySelector("#temp-image")).classList.remove("zoomed");
    return tempKey;
  }

  render() {
    this.clear();
    ensure(this.map).render();
    for (let i = 0; i < this.actors.length; i++) this.actors[i].render();

    this.renderLighting();

    this.renderUI();
  }

  renderLighting() {
    for (let y = 0; y < this.mapy; y++) {
      for (let x = 0; x < this.mapx; x++) {
        const cx = x + this.camera.x;
        const cy = y + this.camera.y;

        if (cx > 0 && cy > 0 && cx < this.width && cy < this.height) {
          if (this.player?.fov?.getMapped(x, y) == 2) {
            const lightValue = ensure(this.player?.fov?.getLight(x, y));
            const rgbLight = rgbToHex(
              float2int(lightValue.r),
              float2int(lightValue.g),
              float2int(lightValue.b),
            );

            const AmbienceFogValue = ensure(
              this.player?.fov?.getAmbienceLight(x, y),
            );

            const ambienceOpacity =
              AmbienceFogValue > 255
                ? 255
                : float2int(AmbienceFogValue as number);

            this.drawRectangle(cx, cy, rgbLight, 64);

            ////"#33AACC",

            this.drawRectangle(
              cx,
              cy,
              this.map?.ambienceColor,
              float2int(ambienceOpacity * 0.15),
            );
          }
        }
      }
    }
  }

  renderUI() {
    const pl = ensure(this.player);

    const hp = ensure(pl.destructible?.hp);
    const ac = pl.destructible?.defense;
    const power_melee = pl.attacker?.power_melee;
    const power_range = pl.attacker?.power_range;
    const rangeWeapon_range = pl.attacker?.rangeAttack_range;

    const maxHP = ensure(pl.destructible?.maxHP);
    const depth = ensure(this.map).depth;
    const turn = ensure(this.turns);
    const xp = pl.destructible?.xp;

    const getHpColor = (): string => {
      if (hp < (maxHP / 100) * 10) return Colors.HP_10_PERCENT;
      else if (hp < (maxHP / 100) * 25) return Colors.HP_25_PERCENT;
      else if (hp < (maxHP / 100) * 50) return Colors.HP_50_PERCENT;
      else if (hp < (maxHP / 100) * 95) return Colors.HP_95_PERCENT;

      return Colors.HP_MAX;
    };

    this.drawText(`HP: ${hp}/${maxHP}`, 1, this.height + 1, getHpColor());
    this.drawText(`AC: ${ac}`, 7, this.height + 1);

    this.drawText(`ATT M: ${power_melee}`, 13, this.height + 1);
    this.drawText(`ATT R: ${power_range}`, 13, this.height + 2);
    this.drawText(`Range: ${rangeWeapon_range}`, 19, this.height + 2);

    this.drawText(`Depth: ${depth}`, this.width - 6, this.height + 1);
    this.drawText(`Turn: ${turn}`, this.width - 6, this.height + 2);

    this.drawText(
      `EXP: ${xp} / ${(pl.ai as PlayerAI)?.getNextLevelXP()}`,
      1,
      this.height + 2,
    );

    const raceName = getRaceNameByIndex(ensure(this.player?.race));
    const className = getClassNameByIndex(ensure(this.player?.class));

    this.drawText(
      `${capitalize(ensure(this.player)?.name)} the ${raceName} ${className}`,
      60,
      this.height + 1,
    );

    const padding = 8;
    const offset = 19;

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
    this.renderVersion();
  }

  renderVersion() {
    const versionText = `Commit ID: ${COMMIT_HASH} | Version: ${VERSION}`;

    this.drawText(
      `${versionText}`,
      80 - 2,
      this.ctx.canvas.height / this.fontSize - 3,
      Colors.VERSION,
      "right",
    );
  }

  async gameloop() {
    while (true) {
      if (this.gameStatus === GameStatus.STARTUP) {
        this.player?.computeFov();

        this.camera.compute(ensure(this.player?.x), ensure(this.player?.y));
        this.render();
      }
      this.gameStatus = GameStatus.IDLE;

      await this.player?.update(ensure(this.player.ai?.movingSpeed));

      if (this.gameStatus === GameStatus.NEW_TURN) {
        for (const actor of this.actors) {
          if (actor !== this.player) {
            await actor.update(ensure(this.player?.ai?.movingSpeed));
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
        if (this.socket) this.socket.emit("dead", this.getStats());
        this.log.add("DEFEAT", Colors.DEFEAT);
        this.player?.fov?.showAll();
        this.saveImage();
        setTimeout(() => {
          // Auto-zoom minimap on defeat
          ensure(document.querySelector("#temp-image")).classList.add("zoomed");
        }, 1 * 1000); // 1 seconds * 1000 milliseconds
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

  getActor(x: number, y: number): Actor | null {
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

  getAnyActor(x: number, y: number): Actor | null {
    return this.actors.find(actor => actor.x === x && actor.y === y) || null;
  }

  getAllActors(x: number, y: number): Actor[] | undefined {
    return this.actors.filter(actor => actor.x === x && actor.y === y);
  }

  getActorsInSphere(
    tileX: number,
    tileY: number,
    size: number,
    ignoreActor: Actor,
  ): Actor[] | null {
    const actorList = [];

    for (const actor of this.actors) {
      if (
        actor !== ignoreActor &&
        actor.destructible &&
        !actor.destructible.isDead() &&
        actor.getDistance(tileX, tileY) <= size
      )
        actorList.push(actor);
    }

    return actorList;
  }

  getActorsInCube(
    tileX: number,
    tileY: number,
    size: number,
    ignoreActor: Actor,
  ): Actor[] | null {
    const actorList = [];

    for (const actor of this.actors) {
      if (
        actor !== ignoreActor &&
        actor.destructible &&
        !actor.destructible.isDead() &&
        actor.x >= tileX - size &&
        actor.x <= tileX + size &&
        actor.y >= tileY - size &&
        actor.y <= tileY + size
      )
        actorList.push(actor);
    }

    return actorList;
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
        this.drawChar(
          "+",
          px + this.camera.x,
          py + this.camera.y,
          Colors.ALLOWED,
        );
        inRange = true;
      } else {
        this.drawChar(
          "+",
          px + this.camera.x,
          py + this.camera.y,
          Colors.DISALLOWED,
        );
        inRange = false;
      }

      const ch = keyPress("game", await this.getch());
      if (ch === "MOVE_LEFT") px--;
      if (ch === "MOVE_RIGHT") px++;
      if (ch === "MOVE_UP") py--;
      if (ch === "MOVE_DOWN") py++;
      if (ch === "MOVE_UP_LEFT") {
        px--;
        py--;
      }
      if (ch === "MOVE_UP_RIGHT") {
        px++;
        py--;
      }
      if (ch === "MOVE_DOWN_LEFT") {
        px--;
        py++;
      }
      if (ch === "MOVE_DOWN_RIGHT") {
        px++;
        py++;
      }
      if (ch === "ESCAPE") break;
      if (ch === "SELECT") {
        if (inRange) {
          return [true, px, py];
        }
      }
    }

    return [false, px, py];
  }

  renderMenuBackground({ title, x, y, w, h }: MenuBackgroundProps) {
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        if ((yy === 0 || yy === h - 1) && xx > 0 && xx < w - 1)
          this.drawChar("-", xx + x, yy + y, Colors.MENU_BORDER);
        else if ((xx === 0 || xx === w - 1) && yy > 0 && yy < h - 1)
          this.drawChar("|", xx + x, yy + y, Colors.MENU_BORDER);
        else if (yy === 0 || xx === 0 || yy === h - 1 || xx === w - 1)
          this.drawChar("+", xx + x, yy + y, Colors.MENU_BORDER);
        else this.drawChar(" ", xx + x, yy + y, Colors.MENU_BORDER);
      }
    }

    for (let i = 0; i < title.length; i++) {
      this.drawChar(
        title.charAt(i),
        x + w / 2 - title.length / 2 + i,
        y,
        Colors.DEFAULT_TEXT,
      );
    }
  }
}

export const game = new Game();

game.run();
