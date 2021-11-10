import "@/index.scss";
import Container from "@/items/container";
import Equipments from "@/items/equipments";
import { createItem } from "@/items/itemGenerator";
//import weaponsJson from "@/items.json";
import Map from "@/map";
import { Camera } from "@/map/camera";
import Fov from "@/map/fov";
import { ABILITIES, Abilities } from "@/rpg/abilities";
import Attacker from "@/rpg/attacker";
import Actor from "@/units/actor";
import { MonsterAI, PlayerAI } from "@/units/ai";
import { MonsterDestructible, PlayerDestructible } from "@/units/destructible";
import {
  createListOfProficiencies,
  debugInit,
  ensure,
  float2int,
  wordWrap,
} from "@/utils";
import { Colors } from "@/utils/colors";
import Log from "@/utils/log";
import { Menu, MenuItemCode } from "@/utils/menu";
import {
  createListOfClasses,
  getClass,
  getClassNameByIndex,
} from "./rpg/classes";
import { createListOfRaces, getRace, getRaceNameByIndex } from "./rpg/races";

export enum GameStatus {
  STARTUP,
  IDLE,
  NEW_TURN,
  VICTORY,
  DEFEAT,
}

//const weapons: Weapon[] = weaponsJson;
//const sword = weapons.find(({ name }: Weapon) => name === "sword");

class Game {
  gameStatus: number = GameStatus.STARTUP;
  player?: Actor;
  map?: Map;
  stairs?: Actor;
  canvas: Element;
  ctx: CanvasRenderingContext2D;
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

  mapx = 80;
  mapy = 80;

  camera: Camera;

  constructor() {
    this.canvas = ensure(document.querySelector("#screen"));

    this.ctx = ensure((this.canvas as HTMLCanvasElement).getContext("2d"));
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

    this.map = new Map(this.mapx, this.mapy);

    this.camera = new Camera();
    this.camera.setCenter(this.width, this.height);

    const tempImage = ensure(document.querySelector("#temp-image"));
    const zoomTempImage = () => {
      tempImage.classList.toggle("zoomed");
    };

    tempImage.addEventListener("click", zoomTempImage);
    // tempImage.removeEventListener("onclick", zoomTempImage);

    //console.log(items);
  }

  async term() {
    this.log = new Log();
    this.actors = [];
    this.map = new Map(this.mapx, this.mapy);
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
          10,
          "your cadaver",
        );
        this.player.attacker = new Attacker("1d4");
        this.player.ai = new PlayerAI();
        this.player.abilities = new Abilities(18, 15, 10, 8, 12);
        this.player.container = new Container(26);
        this.player.equipments = new Equipments();
        this.player.fov = new Fov(this.mapx, this.mapy);
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

      const item = createItem({
        name: "leather armor",
        x: ensure(this.player).x,
        y: ensure(this.player).y,
      });

      const item2 = createItem({
        name: "hide",
        x: ensure(this.player).x + 1,
        y: ensure(this.player).y,
      });

      const item3 = createItem({
        name: "handaxe",
        x: ensure(this.player).x - 1,
        y: ensure(this.player).y,
      });

      this.actors.push(item);
      this.actors.push(item2);
      this.actors.push(item3);
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
    this.map = new Map(this.mapx, this.mapy);
    this.init(true, false);
    this.actors.push(tempPlayer);

    this.save();
  }

  async prepareNewJourney() {
    enum phases {
      choose_race = 0,
      choose_class = 1,
      choose_abilities = 2,
      phases_max,
    }

    let phase = phases.choose_race;
    let selectedRace = 0;
    let selectedClass = 0;
    let selectedAbilities = 0;

    let selectDirection = 0;
    let unusedPoints = 14;

    let hpStart = 0;
    let hpPerLevel = 0;

    let toughnessIncrease = 0;

    const listOfRaces = createListOfRaces();
    const listOfClasses = createListOfClasses();
    const tempAbies = new Abilities(10, 10, 10, 10, 10);
    const finalAbies = new Abilities(10, 10, 10, 10, 10);

    while (true) {
      this.clear();

      for (let i = 0; i < 3; i++) {
        let color = Colors.DEFAULT_TEXT;

        if (phase === phases.choose_race && i === 0)
          color = Colors.HILIGHT_TEXT;

        if (phase === phases.choose_class && i === 1)
          color = Colors.HILIGHT_TEXT;

        if (phase === phases.choose_abilities && i === 2)
          color = Colors.HILIGHT_TEXT;

        if (i == 0) this.drawText("Choose race", 10, 10, color);
        if (i == 1) this.drawText("Choose class", 20, 10, color);
        if (i == 2) this.drawText("Set abilities", 30, 10, color);
      }

      this.drawText(
        "Enter) Next   Backspace) Back   Use arrow keys to navigate",
        11,
        this.height,
        Colors.DEFAULT_TEXT,
      );

      this.drawText("New game", 10, 1, Colors.HILIGHT_TEXT);

      this.drawChar(">", 8, 12 + selectedRace, Colors.DEFAULT_TEXT);
      for (let i = 0; i < listOfRaces.length; i++) {
        this.drawText(listOfRaces[i], 10, 12 + i);
      }

      toughnessIncrease = ensure(
        getRace(listOfRaces[selectedRace])?.toughnessIncrease,
      );
      const resiliences = ensure(
        getRace(listOfRaces[selectedRace])?.resilience,
      );

      const proficiencies = createListOfProficiencies(
        listOfRaces[selectedRace],
        listOfClasses[selectedClass],
      );

      if (phase === phases.choose_race) {
        const flavourText = ensure(
          getRace(listOfRaces[selectedRace])?.flavourText,
        );
        const wordWrapped: string[] = ensure(wordWrap(flavourText, 48));
        for (let i = 0; i < wordWrapped.length; i++) {
          this.drawText(wordWrapped[i], 10, 21 + i, Colors.DEFAULT_TEXT);
        }
      }

      if (phase === phases.choose_class) {
        const flavourText = ensure(
          getClass(listOfClasses[selectedClass])?.flavourText,
        );
        const wordWrapped: string[] = ensure(wordWrap(flavourText, 48));
        for (let i = 0; i < wordWrapped.length; i++) {
          this.drawText(wordWrapped[i], 10, 21 + i, Colors.DEFAULT_TEXT);
        }
      }

      if (toughnessIncrease > 0) {
        this.drawText(
          `hp increase: ${toughnessIncrease} per level`,
          10,
          18,
          Colors.DEFAULT_TEXT,
        );
      }

      if (resiliences !== "none")
        this.drawText(
          `Resiliences: ${resiliences}`,
          10,
          19,
          Colors.DEFAULT_TEXT,
        );

      this.drawText("Profiencies: ", 55, 20);
      if (proficiencies.length > 0) {
        for (let i = 0; i < proficiencies.length; i++) {
          this.drawText(proficiencies[i], 55, 22 + i);
        }
      }

      const abies = ensure(getRace(listOfRaces[selectedRace])?.abilityIncrease);

      this.drawChar(">", 18, 12 + selectedClass, Colors.DEFAULT_TEXT);

      for (let i = 0; i < listOfClasses.length; i++) {
        this.drawText(listOfClasses[i], 20, 12 + i);
      }

      this.drawChar(">", 28, 12 + selectedAbilities, Colors.DEFAULT_TEXT);

      if (phase === phases.choose_abilities) {
        let abilityText = "";
        if (selectedAbilities === 0)
          abilityText = "Strength: Measuring physical power.";
        if (selectedAbilities === 1)
          abilityText = "Dexterity: Measuring agility.";
        if (selectedAbilities === 2)
          abilityText = "Constitution: Measuring endurance.";
        if (selectedAbilities === 3)
          abilityText = "Intelligence: Measuring reasoning and memory.";
        if (selectedAbilities === 4)
          abilityText = "Wisdom: Measuring perception and insight.";

        this.drawText(abilityText, 10, 21);

        this.drawText(
          "Use left and right arrows to change ability scores.",
          30,
          19,
        );
      }

      this.drawText("Strength", 30, 12);
      this.drawText("Dexterity", 30, 13);
      this.drawText("Constitution", 30, 14);
      this.drawText("Intelligence", 30, 15);
      this.drawText("Wisdom", 30, 16);
      this.drawText("Unused points", 30, 17);

      this.drawText(`${tempAbies.str}`, 37, 12);
      this.drawText(`${tempAbies.dex}`, 37, 13);
      this.drawText(`${tempAbies.con}`, 37, 14);
      this.drawText(`${tempAbies.int}`, 37, 15);
      this.drawText(`${tempAbies.wis}`, 37, 16);
      this.drawText(`${unusedPoints}`, 37, 17);

      this.drawText(abies.str !== 0 ? `+${abies.str.toString()}` : "", 39, 12);
      this.drawText(abies.dex !== 0 ? `+${abies.dex.toString()}` : "", 39, 13);
      this.drawText(abies.con !== 0 ? `+${abies.con.toString()}` : "", 39, 14);
      this.drawText(abies.int !== 0 ? `+${abies.int.toString()}` : "", 39, 15);
      this.drawText(abies.wis !== 0 ? `+${abies.wis.toString()}` : "", 39, 16);

      finalAbies.str = tempAbies.str + abies.str;
      finalAbies.dex = tempAbies.dex + abies.dex;
      finalAbies.con = tempAbies.con + abies.con;
      finalAbies.int = tempAbies.int + abies.int;
      finalAbies.wis = tempAbies.wis + abies.wis;

      this.drawText(
        `= ${finalAbies.str.toString()} (${finalAbies.getBonusWithSign(
          ABILITIES.STR,
        )})`,
        41,
        12,
      );
      this.drawText(
        `= ${finalAbies.dex.toString()} (${finalAbies.getBonusWithSign(
          ABILITIES.DEX,
        )})`,
        41,
        13,
      );
      this.drawText(
        `= ${finalAbies.con.toString()} (${finalAbies.getBonusWithSign(
          ABILITIES.CON,
        )})`,
        41,
        14,
      );
      this.drawText(
        `= ${finalAbies.int.toString()} (${finalAbies.getBonusWithSign(
          ABILITIES.INT,
        )})`,
        41,
        15,
      );
      this.drawText(
        `= ${finalAbies.wis.toString()} (${finalAbies.getBonusWithSign(
          ABILITIES.WIS,
        )})`,
        41,
        16,
      );

      hpStart = ensure(getClass(listOfClasses[selectedClass])?.healthAtStart);
      hpPerLevel = ensure(
        getClass(listOfClasses[selectedClass])?.healthIncreasePerLevel,
      );

      const conModi = finalAbies.getBonus(ABILITIES.CON);
      const finalHP = hpStart + conModi;
      const finalHPperLevel = hpPerLevel + conModi;

      this.drawText(
        `Health at start: ${hpStart} + ${conModi} (CON) = ${finalHP}`,
        50,
        12,
      );
      this.drawText(
        `Health increase per level +${hpPerLevel} + ${conModi} (CON) = ${finalHPperLevel}`,
        50,
        13,
      );

      const ch = await this.getch();

      if (ch === "q") break;
      if (ch === "Enter") {
        phase++;
        if (phase >= phases.phases_max) break;
      }
      if (ch === "Backspace") {
        phase--;
        if (phase < 0) phase = 0;
      }

      if (ch === "ArrowUp") {
        selectDirection = -1;
      } else if (ch === "ArrowDown") {
        selectDirection = 1;
      } else {
        selectDirection = 0;
      }

      if (phase === phases.choose_abilities) {
        let abiD = 0;
        if (ch === "ArrowLeft") {
          abiD = -1;
        } else if (ch === "ArrowRight") {
          abiD = 1;
        }

        if (unusedPoints - abiD >= 0) {
          if (selectedAbilities === 0) {
            if (tempAbies.inRange(tempAbies.str + abiD)) tempAbies.str += abiD;
            else abiD = 0;
          }
          if (selectedAbilities === 1) {
            if (tempAbies.inRange(tempAbies.dex + abiD)) tempAbies.dex += abiD;
            else abiD = 0;
          }
          if (selectedAbilities === 2) {
            if (tempAbies.inRange(tempAbies.con + abiD)) tempAbies.con += abiD;
            else abiD = 0;
          }
          if (selectedAbilities === 3) {
            if (tempAbies.inRange(tempAbies.int + abiD)) tempAbies.int += abiD;
            else abiD = 0;
          }
          if (selectedAbilities === 4) {
            if (tempAbies.inRange(tempAbies.wis + abiD)) tempAbies.wis += abiD;
            else abiD = 0;
          }

          unusedPoints -= abiD;
        }
      }

      if (phase === phases.choose_race) {
        selectedRace += selectDirection;
        if (selectedRace < 0) selectedRace = listOfRaces.length - 1;
        if (selectedRace > listOfRaces.length - 1) selectedRace = 0;
      }

      if (phase === phases.choose_class) {
        selectedClass += selectDirection;
        if (selectedClass < 0) selectedClass = listOfClasses.length - 1;
        if (selectedClass > listOfClasses.length - 1) selectedClass = 0;
      }

      if (phase === phases.choose_abilities) {
        selectedAbilities += selectDirection;
        if (selectedAbilities < 0) selectedAbilities = 4;
        if (selectedAbilities > 4) selectedAbilities = 0;
      }
    }

    return [
      finalAbies,
      selectedRace,
      selectedClass,
      hpStart,
      hpPerLevel,
      toughnessIncrease,
    ];
  }

  async newGame() {
    this.masterSeed = float2int(Math.random() * 0x7ffffff);

    //choose race, class, abilities and give name
    const [abi, selRace, selClass, hpStart, hpPerLevel, hpIncreasePerLevel] =
      await this.prepareNewJourney();

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

    const raceName = getRaceNameByIndex(selRace as number);
    const className = getClassNameByIndex(selClass as number);

    const newName = `${this.player?.name} the ${raceName} ${className}`;
    pl.name = newName;
    const hpBonus = (abi as Abilities).getBonus(ABILITIES.CON) as number;
    ensure(pl.destructible).maxHP = (hpStart as number) + hpBonus;
    ensure(pl.destructible).hp = ensure(pl.destructible)?.maxHP;

    ensure(pl.destructible).hpPerLevel = hpPerLevel as number;
    ensure(pl.destructible).hpPerLevelBonuses = hpIncreasePerLevel as number;

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

        if (actor.container) {
          this.actors[i].container = await new Container(26);

          for (const it of actor.container.inventory) {
            const k =
              ensure(this.actors[i].container).inventory.push(
                new Actor(it.x, it.y, it.ch, it.name, it.color),
              ) - 1;
            //ensure(this.actors[i].container).inventory[k].create(it);
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
            //console.log(">>");
            //console.log(it);
            //ensure(this.actors[i].equipments?.add(it));
            ensure(this.actors[i].equipments).add(
              createItem({ name: it.name, x: it.x, y: it.y }),
            );

            /*
            const k =
              ensure(this.actors[i].equipments).items.push(
                new Actor(it.x, it.y, it.ch, it.name, it.color),
              ) - 1;
            ensure(this.actors[i].equipments).add(it);
            */
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
              10,
              "player corpse",
            );

            this.actors[i].ai = new PlayerAI();
            ensure(this.actors[i].destructible).xp = actor.destructible.xp;
            ensure(this.actors[i].destructible).hpPerLevel =
              actor.destructible.hpPerLevel;
            ensure(this.actors[i].destructible).hpPerLevelBonuses =
              actor.destructible.hpPerLevelBonuses;

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

  saveImage() {
    const tempW = this.width;
    const tempH = this.height;

    const oldCameraX = this.camera.x;
    const oldCameraY = this.camera.y;

    this.width = this.mapx;
    this.height = this.mapy;

    const tempImage = ensure(document.querySelector("#temp-image"));
    tempImage.classList.remove("hidden");
    const tempImageCanvas = ensure(
      document.querySelector("#temp-image-canvas"),
    );

    this.canvas = tempImageCanvas;
    this.ctx = ensure((this.canvas as HTMLCanvasElement).getContext("2d"));
    this.ctx.canvas.width = this.mapx * this.fontSize;
    this.ctx.canvas.height = this.mapy * this.fontSize;

    this.camera.x = 0;
    this.camera.y = 0;

    this.clear();
    ensure(this.map).render();
    for (let i = 0; i < this.actors.length; i++) this.actors[i].render();

    this.canvas = ensure(document.getElementById("screen"));
    this.ctx = ensure((this.canvas as HTMLCanvasElement).getContext("2d"));

    this.width = tempW;
    this.height = tempH;

    this.camera.x = oldCameraX;
    this.camera.y = oldCameraY;
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
    ensure(document.querySelector("#temp-image")).classList.remove("zoomed");
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
      else if (hp < (maxHP / 100) * 95) return Colors.HP_95_PERCENT;

      return Colors.HP_MAX;
    };

    this.drawText(`HP: ${hp}/${maxHP}`, 1, this.height + 1, getHpColor());
    this.drawText(`ATT: ${power}`, 7, this.height + 1);
    this.drawText(`AC: ${ac}`, 13, this.height + 1);

    this.drawText(`Depth: ${depth}`, this.width - 6, this.height + 1);
    this.drawText(`Turn: ${turn}`, this.width - 6, this.height + 2);

    this.drawText(
      `EXP: ${xp} / ${(pl.ai as PlayerAI)?.getNextLevelXP()}`,
      1,
      this.height + 2,
    );

    this.drawText(`${this.player?.name}`, 60, this.height + 1);

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

    this.drawText("Weared", this.width - 20, this.height + 3);
    let a = 0;
    if (pl.equipments && pl.equipments?.items.length > 0) {
      for (const actor of ensure(pl.equipments?.items)) {
        this.drawText(actor.name, this.width - 20, this.height + 4 + a);
        a++;
      }
    }
  }

  async gameloop() {
    while (true) {
      if (this.gameStatus === GameStatus.STARTUP) {
        this.player?.computeFov();
        this.camera.compute(ensure(this.player?.x), ensure(this.player?.y));
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
