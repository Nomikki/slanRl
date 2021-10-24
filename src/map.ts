import { game } from ".";
import Actor from "./actor";
import { ConfusedMonsterAi } from "./ai";
import bspGenerator from "./bsp_generator";
import Destructible from "./destructible";
import { createMonster } from "./monsterGenerator";
import Pickable, {
  AiChangeEffect,
  HealthEffect,
  SelectorType,
  TargetSelector,
} from "./pickable";
import Randomizer from "./random";
import Rectangle from "./rectangle";
import { float2int } from "./utils";

export const random = new Randomizer();

class Tile {
  canWalk = false;
  explored = false;
}

export default class Map {
  width: number;
  height: number;

  startX = 0;
  startY = 0;
  stairsX = 0;
  stairsY = 0;

  levelSeed = 0;
  depth = 0;

  readonly ROOM_MAX_SIZE: number = 10;
  readonly ROOM_MIN_SIZE: number = 4;
  readonly MAX_ROOM_MONSTERS: number = 3;
  readonly MAX_ROOM_ITEMS: number = 2;

  tiles: any;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  save() {
    window.localStorage.setItem("seed", this.levelSeed.toString());
    window.localStorage.setItem("depth", this.depth.toString());
  }

  isWall(x: number, y: number): boolean {
    const index = x + y * this.width;
    return !this.tiles[index].canWalk;
  }

  setWall(x: number, y: number) {
    this.tiles[x + y * this.width].canWalk = false;
  }

  canWalk(x: number, y: number): boolean {
    if (this.isWall(x, y)) return false;
    for (const actor of game.actors) {
      if (actor.x === x && actor.y === y && actor.blocks) {
        return false;
      }
    }
    return true;
  }

  addMonster(x: number, y: number) {
    const rng = random.getInt(0, 100);

    if (rng < 60) {
      game.actors.push(createMonster("orc", x, y));
    } else if (rng < 60 + 10) {
      game.actors.push(createMonster("troll", x, y));
    } else {
      game.actors.push(createMonster("rat", x, y));
    }
  }

  openCloseDoor(x: number, y: number): boolean {
    const actor = game.getActor(x, y);
    if (actor && actor.name === "door") {
      actor.blocks = !actor.blocks;
      if (actor.blocks) {
        actor.ch = "D";
        game.log.add("The door is closed");
      } else {
        actor.ch = "+";
        game.log.add("The door is opened");
      }
      return true;
    }
    return false;
  }

  addDoor(x: number, y: number, closed: boolean) {
    const door = new Actor(x, y, closed ? "D" : "+", "door", "#AA0");
    door.blocks = true;
    door.destructible = new Destructible(100, 0, "broken door", "door", 0);
    game.actors.push(door);
  }

  additem(x: number, y: number) {
    const rng = random.getInt(0, 100);
    if (rng < 70) {
      if (random.getInt(0, 100) < 95) {
        const healthPotion = new Actor(x, y, "!", "health potion", "#FF00FF");
        healthPotion.blocks = false;
        healthPotion.pickable = new Pickable(
          undefined,
          new HealthEffect(4, undefined),
        );
        game.actors.push(healthPotion);
        game.sendToBack(healthPotion);
      } else {
        const healthPotion = new Actor(x, y, "@", "Nutella bun", "#A80");
        healthPotion.blocks = false;
        healthPotion.pickable = new Pickable(
          undefined,
          new HealthEffect(30, undefined),
        );
        game.actors.push(healthPotion);
        game.sendToBack(healthPotion);
        console.log("Jossain haisoo nutella!");
      }
    } else if (rng < 70 + 10) {
      const scrollOfLightingBolt = new Actor(
        x,
        y,
        "#",
        "scroll of lighting bolt",
        "#0FF",
      );
      scrollOfLightingBolt.blocks = false;
      //scrollOfLightingBolt.pickable = new LightningBolt(5, 20);
      scrollOfLightingBolt.pickable = new Pickable(
        new TargetSelector(SelectorType.CLOSEST_MONSTER, 5),
        new HealthEffect(-20, "A lighting bolt strikes!"),
      );
      game.actors.push(scrollOfLightingBolt);
      game.sendToBack(scrollOfLightingBolt);
    } else if (rng < 70 + 20) {
      const scrollOfFireball = new Actor(
        x,
        y,
        "#",
        "scroll of Fireball",
        "#FA0",
      );
      scrollOfFireball.blocks = false;
      //scrollOfFireball.pickable = new Fireball(2, 5);
      scrollOfFireball.pickable = new Pickable(
        new TargetSelector(SelectorType.SELECTED_RANGE, 3),
        new HealthEffect(-12, "hurdur"),
      );
      game.actors.push(scrollOfFireball);
      game.sendToBack(scrollOfFireball);
    } else {
      const scrollOfConfusion = new Actor(
        x,
        y,
        "#",
        "scroll of Confusion",
        "#FFA",
      );
      scrollOfConfusion.blocks = false;
      //scrollOfConfusion.pickable = new Confuser(10, 8);
      scrollOfConfusion.pickable = new Pickable(
        new TargetSelector(SelectorType.SELECTED_MONSTER, 5),
        new AiChangeEffect(new ConfusedMonsterAi(10), "confused af"),
      );
      game.actors.push(scrollOfConfusion);
      game.sendToBack(scrollOfConfusion);
      //console.log("conf!");
    }
  }

  dig(x1: number, y1: number, x2: number, y2: number, withActors: boolean) {
    x1 = float2int(x1);
    x2 = float2int(x2);
    y1 = float2int(y1);
    y2 = float2int(y2);

    if (x2 < x1) {
      const tmp = x2;
      x2 = x1;
      x1 = tmp;
    }

    if (y2 < y1) {
      const tmp = y2;
      y2 = y1;
      y1 = tmp;
    }

    let lastWalkable = false;

    for (let tilex = x1; tilex <= x2; tilex++) {
      for (let tiley = y1; tiley <= y2; tiley++) {
        const index = tilex + tiley * this.width;

        if (
          this.tiles[index].canWalk == false &&
          lastWalkable === true &&
          (x1 === x2 || y1 === y2)
        ) {
          if (withActors) this.addDoor(tilex, tiley, true);
        }
        lastWalkable = this.tiles[index].canWalk;

        this.tiles[index].canWalk = true;
      }
    }
  }

  addActors(room: Rectangle) {
    let numberOfMonsters = random.getInt(0, this.MAX_ROOM_MONSTERS);
    let numberOfItems = random.getInt(0, this.MAX_ROOM_ITEMS);
    //console.log(room);
    const x1 = room.x;
    const x2 = room.x + room.w;
    const y1 = room.y;
    const y2 = room.y + room.h;

    while (numberOfMonsters > 0) {
      const x = random.getInt(x1, x2);
      const y = random.getInt(y1, y2);
      if (this.canWalk(x, y)) {
        this.addMonster(x, y);
      }
      numberOfMonsters--;
    }

    while (numberOfItems > 0) {
      const x = random.getInt(x1, x2);
      const y = random.getInt(y1, y2);
      if (this.canWalk(x, y)) {
        this.additem(x, y);
      }
      numberOfItems--;
    }
  }

  createRoom(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    withActors: boolean,
  ) {
    this.dig(x1, y1, x2, y2, withActors);

    /*
    this.stairsX = ((x1 + x2) / 2) | 0;
    this.stairsY = ((y1 + y2) / 2) | 0;
    
    
    this.startX = this.stairsX;
    this.startY = this.stairsY;
    */
  }

  generate(withActors: boolean, seed: number, depth: number) {
    this.levelSeed = seed;
    this.depth = depth;

    random.setSeed(this.levelSeed + depth * 25);
    console.log("seed: " + this.levelSeed);
    console.log("depth: " + this.depth);

    const root = new bspGenerator(0, 0, this.width, this.height, 5);
    this.tiles = new Array(this.width * this.height).fill(false);

    const monsterRooms = [];

    //const option = random.getInt(0, 2);
    //console.log("option: " + option);
    const option = 2;

    for (let i = 0; i < this.width * this.height; i++) {
      this.tiles[i] = new Tile();

      //we can use path/room data directly from bsp if we want.
      //if (option === 0) this.tiles[i].canWalk = !this.root.map[i];
    }

    //lets create every room one by one
    let lastx = 0;
    let lasty = 0;
    let x = 0;
    let y = 0;
    let w = 0;
    let h = 0;

    //take one room and make it spawn room
    const spawnRoomIndex = random.getInt(0, root.rooms.length - 1);
    const stairsRoomIndex = random.getInt(0, root.rooms.length - 1);

    console.log(
      "spwanroom index: " + spawnRoomIndex + " / " + (root.rooms.length - 1),
    );
    for (let i = 0; i < root.rooms.length; i++) {
      const room = root.rooms[i];
      const spawnRoom = i === spawnRoomIndex ? true : false;

      //option 1
      /*
      if (option === 1) {
        w = room.w;
        h = room.h;
        x = room.x + 1;
        y = room.y + 1;

        this.createRoom(x, y, x + w - 2, y + h - 2);
        if (!spawnRoom) monsterRooms.push(new Rectangle(x, y, w - 2, h - 2));
      }
      */

      //option 2

      if (option === 2) {
        w = random.getInt(this.ROOM_MIN_SIZE, room.w - 2);
        h = random.getInt(this.ROOM_MIN_SIZE, room.h - 2);
        x = random.getInt(room.x, room.x + room.w - w - 0) + 1;
        y = random.getInt(room.y, room.y + room.h - h - 0) + 1;

        this.createRoom(x, y, x + w - 2, y + h - 2, withActors);
        if (!spawnRoom) monsterRooms.push(new Rectangle(x, y, w - 2, h - 2));
      }

      if (i === spawnRoomIndex) {
        this.startX = x + float2int(w / 2);
        this.startY = y + float2int(h / 2);
      }
      if (i === stairsRoomIndex) {
        this.stairsX = float2int(x + w / 2);
        this.stairsY = float2int(y + h / 2);
      }

      if (/*option === 1 ||*/ option === 2) {
        if (i > 0) {
          this.dig(lastx, lasty, x + w / 2, lasty, withActors);
          this.dig(x + w / 2, lasty, x + w / 2, y + h / 2, withActors);
        }
        lastx = x + w / 2;
        lasty = y + h / 2;
      }
    }
    if (withActors) {
      for (const room of monsterRooms) {
        this.addActors(room);
      }
    }
  }

  render() {
    const darkWall = "#";
    const darkGround = ".";

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const fovValue = game.player?.fov?.getMapped(x, y);
        if (fovValue === 2 || fovValue === 1) {
          if (fovValue === 2) {
            game.drawChar(
              this.isWall(x, y) ? darkWall : darkGround,
              x,
              y,
              "#AAA",
            );
          } else {
            game.drawChar(
              this.isWall(x, y) ? darkWall : darkGround,
              x,
              y,
              "#444",
            );
          }
        }
      }
    }
  }
}
