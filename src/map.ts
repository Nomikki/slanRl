import { game } from ".";
import Actor from "./actor";
import bspGenerator from "./bsp_generator";
import { Colors } from "./colors";
import { createItem } from "./itemGenerator";
import { createMonster } from "./monsterGenerator";
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

  readonly ROOM_MAX_SIZE: number = 5;
  readonly ROOM_MIN_SIZE: number = 4;
  readonly MAX_ROOM_MONSTERS: number = 3;
  readonly MAX_ROOM_ITEMS: number = 2;

  tiles: Tile[];
  templateDoors: Rectangle[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.templateDoors = [];
    this.tiles = new Array(this.width * this.height).fill(false);
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
    const actor = game.getAnyActor(x, y);
    if (actor && actor.name === "door") {
      actor.blocks = !actor.blocks;
      if (actor.blocks) {
        actor.ch = "D";
        game.log.add("a door is closed");
      } else {
        actor.ch = "+";
        game.log.add("a door is opened");
      }
      return true;
    }
    return false;
  }

  addDoor(x: number, y: number, closed: boolean) {
    const door = new Actor(x, y, closed ? "D" : "+", "door", Colors.DOOR);
    door.blocks = true;
    //door.destructible = new Destructible(100, 0, "broken door", "door", 0);
    //add door, if its between walls
    if (
      (this.isWall(x - 1, y) == true && this.isWall(x + 1, y) == true) ||
      (this.isWall(x, y - 1) == true && this.isWall(x, y + 1) == true)
    )
      game.actors.push(door);
  }

  additem(x: number, y: number) {
    const rng = random.getInt(0, 100);
    let item: Actor;

    if (rng < 70) {
      if (random.getInt(0, 100) < 95) {
        item = createItem({ name: "health potion", x, y });
      } else {
        item = createItem({ name: "nutella bun", x, y });
        console.log("Jossain haisoo nutella!");
      }
    } else if (rng < 70 + 10) {
      item = createItem({ name: "scroll of lighting bolt", x, y });
    } else if (rng < 70 + 20) {
      item = createItem({ name: "scroll of fireball", x, y });
    } else if (rng < 70 + 25) {
      item = createItem({ name: "scroll of confusion", x, y });
    } else {
      item = createItem({ name: "scroll of map", x, y });
    }

    if (item) {
      game.actors.push(item);
      game.sendToBack(item);
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
          if (withActors && tilex !== this.stairsX && tiley !== this.stairsY) {
            this.templateDoors.push(new Rectangle(tilex, tiley, 0, 0));
          }
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

    const maxSplitLevel = random.getInt(4, 8);
    console.log("seed: " + this.levelSeed);
    console.log("depth: " + this.depth);
    console.log("split level:" + maxSplitLevel);

    const root = new bspGenerator(0, 0, this.width, this.height, maxSplitLevel);
    this.tiles = new Array(this.width * this.height).fill(false);

    const monsterRooms = [];

    //const option = random.getInt(0, 2);
    //console.log("option: " + option);
    const option = random.getInt(1, 2);

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
    /*
    console.log(
      "spwanroom index: " + spawnRoomIndex + " / " + (root.rooms.length - 1),
    );
    */
    for (let i = 0; i < root.rooms.length; i++) {
      const room = root.rooms[i];
      const spawnRoom = i === spawnRoomIndex ? true : false;

      //option 1
      if (option === 1) {
        w = room.w;
        h = room.h;
        x = room.x + 1;
        y = room.y + 1;

        this.createRoom(x, y, x + w - 2, y + h - 2, withActors);
        if (!spawnRoom) monsterRooms.push(new Rectangle(x, y, w - 2, h - 2));
      }

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

      if (option === 1 || option === 2) {
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

      for (const door of this.templateDoors) {
        this.addDoor(door.x, door.y, true);
      }
    }
  }

  render() {
    const darkWall = "#";
    const darkGround = ".";

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const fovValue = game.player?.fov?.getMapped(x, y);
        const cx = x + game.camera.x;
        const cy = y + game.camera.y;

        if (fovValue === 2 || fovValue === 1) {
          if (fovValue === 2) {
            game.drawChar(
              this.isWall(x, y) ? darkWall : darkGround,
              cx,
              cy,
              Colors.WALL,
            );
          } else {
            game.drawChar(
              this.isWall(x, y) ? darkWall : darkGround,
              cx,
              cy,
              Colors.WALL_DARK,
            );
          }
        }
      }
    }
  }
}
