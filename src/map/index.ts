import { game } from "@/index";
import { createItem } from "@/items/itemGenerator";
import bspGenerator from "@/map/bsp_generator";
import { createMonster } from "@/rpg/monsterGenerator";
import Actor from "@/units/actor";
import { ensure, float2int } from "@/utils";
import { Colors } from "@/utils/colors";
import Randomizer from "@/utils/random";
import Rectangle from "@/utils/rectangle";

export const random = new Randomizer();

class Tile {
  canWalk = false;
  explored = false;
}

export default class Map {
  width: number;
  height: number;
  ambienceColor: string;
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
    this.ambienceColor = "#AAAAAA";
  }

  save() {
    window.localStorage.setItem("seed", this.levelSeed.toString());
    window.localStorage.setItem("depth", this.depth.toString());
  }

  isWall(x: number, y: number): boolean {
    if (x >= 0 && x <= this.width && y >= 0 && y <= this.height) {
      const index = x + y * this.width;

      return !this.tiles[index].canWalk;
    }

    return false;
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
    //its just placeholder code

    if (this.depth === 1) {
      const monsterListSmall = [
        "bat",
        "rat",
        "jackal",
        "lizard",
        "kobold",
        "giant rat",
      ];

      const monsterListBig = ["giant rat", "orc", "ghoul"];

      if (random.getInt(0, 100) > 5) {
        const rng = random.getInt(0, monsterListSmall.length);
        game.actors.push(createMonster(monsterListSmall[rng], x, y));
      } else {
        const rng = random.getInt(0, monsterListBig.length);
        game.actors.push(createMonster(monsterListBig[rng], x, y));
      }
    } else if (this.depth === 2) {
      const monsterListSmall = [
        "rat",
        "jackal",
        "lizard",
        "kobold",
        "kobold",
        "giant rat",
      ];

      const monsterListBig = ["giant rat", "orc", "ghoul", "troll"];

      if (random.getInt(0, 100) > 5) {
        const rng = random.getInt(0, monsterListSmall.length);
        game.actors.push(createMonster(monsterListSmall[rng], x, y));
      } else {
        const rng = random.getInt(0, monsterListBig.length);
        game.actors.push(createMonster(monsterListBig[rng], x, y));
      }
    } else if (this.depth >= 3) {
      const monsterListSmall = ["giant rat", "jackal", "kobold"];

      const monsterListBig = ["giant rat", "orc", "ghoul", "troll"];

      if (random.getInt(0, 100) > 15) {
        const rng = random.getInt(0, monsterListSmall.length);
        game.actors.push(createMonster(monsterListSmall[rng], x, y));
      } else {
        const rng = random.getInt(0, monsterListBig.length);
        game.actors.push(createMonster(monsterListBig[rng], x, y));
      }
    }
  }

  pushTo(x: number, y: number, dx: number, dy: number): boolean {
    //console.log(x, y, dx, dy);

    const actorList = [];
    for (const c of game.actors) {
      if (
        c.x === x &&
        c.y === y &&
        (c.pickable || (c.destructible && c.destructible.isDead()))
      ) {
        actorList.push(c);
      }
    }

    for (const c of actorList) {
      if (this.canWalk(c.x + dx, c.y + dy)) {
        c.x += dx;
        c.y += dy;
      } else {
        game.log.add("Can't push");
        break;
      }
    }
    if (actorList.length > 0) return true;

    return false;
  }

  pullTo(x: number, y: number, dx: number, dy: number): boolean {
    if (!this.canWalk(x + dx, y + dy)) {
      game.log.add("Can't pull");
      return false;
    }
    const actorList = [];
    for (const c of game.actors) {
      if (
        c.x === x - dx &&
        c.y === y - dy &&
        (c.pickable || (c.destructible && c.destructible.isDead()))
      ) {
        actorList.push(c);
      }
    }

    for (const c of actorList) {
      c.x += dx;
      c.y += dy;
    }
    if (actorList.length > 0) return true;

    return true;
  }

  findDoor(x: number, y: number): Actor | undefined {
    const actors = game.getAllActors(x, y);
    let door = undefined;
    if (actors) {
      for (const actor of actors) {
        if (actor && actor.name === "door") {
          door = actor; //door found
        } else if (actor) {
          game.log.add("There's something and it's blocking!");
          return undefined;
        }
      }
    }
    return door;
  }

  openCloseDoor(x: number, y: number): boolean {
    const door = this.findDoor(x, y);
    if (door) {
      door.doorOpenOrClose();
      return true;
    }

    return false;
  }

  isThereSecretDoor(area: Rectangle): boolean {
    for (const c of game.actors) {
      if (
        c.x >= area.x &&
        c.x <= area.x + area.w + 2 &&
        c.y >= area.y &&
        c.y <= area.y + area.h + 2
      ) {
        if (c.ch === "#" && c.name === "door") return true;
      }
    }
    return false;
  }

  addDoor(x: number, y: number, closed: boolean) {
    const door = new Actor(x, y, closed ? "D" : "+", "door", Colors.DOOR);
    door.blocks = true;
    door.fovOnly = false;
    let createDoor = false;

    //add door, if its between walls
    if (this.isWall(x - 1, y) == true && this.isWall(x + 1, y) == true) {
      createDoor = true;
    }
    if (this.isWall(x, y - 1) == true && this.isWall(x, y + 1) == true) {
      createDoor = true;
    }

    if (createDoor) {
      game.actors.push(door);
      game.sendToBack(door);
    } else {
      return;
    }

    //make secret door!
    const rng = random.getInt(0, 100);
    if (rng < 20) {
      door.ch = "#";
      door.color = Colors.WALL;
    }
  }

  addItemWithName(name: string, x: number, y: number): Actor | undefined {
    const item = createItem({ name, x, y });
    if (item) {
      game.actors.push(item);
      return item;
    }
    return undefined;
  }

  additem(x: number, y: number) {
    const rng = random.getInt(0, 100);
    let item: Actor;

    if (rng < 70) {
      if (random.getInt(0, 100) < 95) {
        item = createItem({ name: "health potion", x, y });
      } else {
        item = createItem({ name: "nutella bun", x, y });
        console.log("There is a faint smell of nutella in the air!");
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

  howManyWalls(x: number, y: number): number {
    if (x > 0 && y > 0 && x < this.width - 1 && y < this.height - 1) {
      let count = 0;
      if (this.isWall(x - 1, y)) count++;
      if (this.isWall(x + 1, y)) count++;
      if (this.isWall(x, y - 1)) count++;
      if (this.isWall(x, y + 1)) count++;
      return count;
    }

    return 0;
  }

  generate(withActors: boolean, seed: number, depth: number) {
    this.levelSeed = seed;
    this.depth = depth;

    random.setSeed(this.levelSeed + depth * 25);

    const maxSplitLevel = random.getInt(4, 8);
    console.log("seed: " + this.levelSeed);
    console.log("depth: " + this.depth);
    console.log("split level:" + maxSplitLevel);

    this.ambienceColor =
      Colors.AMBIENCE_COLOR[random.getInt(0, Colors.AMBIENCE_COLOR.length)];

    this.tiles = new Array(this.width * this.height).fill(false);

    const monsterRooms = [];
    for (let i = 0; i < this.width * this.height; i++) {
      this.tiles[i] = new Tile();
    }

    const root = new bspGenerator(0, 0, this.width, this.height, maxSplitLevel);

    const option = random.getInt(0, 100) > 70 ? 1 : 2;

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

    for (let i = 0; i < root.rooms.length; i++) {
      const room = root.rooms[i];
      const spawnRoom = i === spawnRoomIndex ? true : false;

      //option 1
      if (option === 1) {
        w = room.w;
        h = room.h;
        x = room.x + 1;
        y = room.y + 1;

        if (w <= 0) w = 1;
        if (h <= 0) h = 1;
        if (x <= 0) x = 1;
        if (y <= 0) y = 1;

        this.createRoom(x, y, x + w - 2, y + h - 2, withActors);
        if (!spawnRoom) monsterRooms.push(new Rectangle(x, y, w - 2, h - 2));
      }

      //option 2
      if (option === 2) {
        w = random.getInt(this.ROOM_MIN_SIZE, room.w - 2);
        h = random.getInt(this.ROOM_MIN_SIZE, room.h - 2);
        x = random.getInt(room.x, room.x + room.w - w - 0) + 1;
        y = random.getInt(room.y, room.y + room.h - h - 0) + 1;

        if (w <= 0) w = 1;
        if (h <= 0) h = 1;
        if (x <= 0) x = 1;
        if (y <= 0) y = 1;

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

      for (const room of monsterRooms) {
        if (room.w >= 3 || room.h >= 3) {
          const torches = [];
          if (this.howManyWalls(room.x, room.y) > 1)
            torches.push(this.addItemWithName("torch", room.x, room.y));
          if (this.howManyWalls(room.x + room.w, room.y) > 1)
            torches.push(
              this.addItemWithName("torch", room.x + room.w, room.y),
            );
          if (this.howManyWalls(room.x, room.y + room.h) > 1)
            torches.push(
              this.addItemWithName("torch", room.x, room.y + room.h),
            );
          if (this.howManyWalls(room.x + room.w, room.y + room.h) > 1)
            torches.push(
              this.addItemWithName("torch", room.x + room.w, room.y + room.h),
            );
          //if there's secret, one torch is reversed
          if (this.isThereSecretDoor(room) && torches.length > 0) {
            ensure(torches[random.getInt(0, torches.length - 1)]).ch = "í";
            console.log("prup!");
          }
        }
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
