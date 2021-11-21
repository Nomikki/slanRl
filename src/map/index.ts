import { game } from "@/index";
import Container from "@/items/container";
import { createItem } from "@/items/itemGenerator";
import bspGenerator from "@/map/bsp_generator";
import { Abilities } from "@/rpg/abilities";
import { createMonster } from "@/rpg/monsterGenerator";
import Actor from "@/units/actor";
import Destructible from "@/units/destructible";
import { ensure, float2int } from "@/utils";
import { Colors } from "@/utils/colors";
import Randomizer from "@/utils/random";
import Rectangle from "@/utils/rectangle";

export const random = new Randomizer();

class Tile {
  canWalk = false;
  explored = false;
  color = "#000000";
  character = "?";
}

export default class Map {
  width: number;
  height: number;
  ambienceColor: string;
  startX = 0;
  startY = 0;
  stairsX = 0;
  stairsY = 0;

  //darkLevel: number;

  levelSeed = 0;
  depth = 0;

  readonly ROOM_MAX_SIZE: number = 5;
  readonly ROOM_MIN_SIZE: number = 4;
  readonly MAX_ROOM_MONSTERS: number = 3;
  readonly MAX_ROOM_ITEMS: number = 2;

  tiles: Tile[];
  templateDoors: Rectangle[];
  monsterRooms: Rectangle[];
  noisemap: number[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.templateDoors = [];
    this.monsterRooms = [];
    this.noisemap = new Array(this.width * this.height).fill(0);
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
        (c.container ||
          c.pickable ||
          (c.destructible && c.destructible.isDead()))
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
        (c.container ||
          c.pickable ||
          (c.destructible && c.destructible.isDead()))
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

  findContainer(x: number, y: number): Actor | undefined {
    const containers = game.getAllActors(x, y);
    let container = undefined;
    if (containers) {
      for (const actor of containers) {
        if (actor && actor.container && !actor.attacker) {
          container = actor; //container found
        }
      }
    }
    return container;
  }

  async openContainer(target: Actor, x: number, y: number) {
    const container = this.findContainer(x, y);
    if (container) {
      await container.openAsContainer(target);
      return true;
    }

    return false;
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
        if (!lastWalkable) {
          const r = random.getInt(0, 200);
          if (r < 10) this.tiles[index].character = "'";
          else if (r < 15) this.tiles[index].character = "`";
          else if (r < 20) this.tiles[index].character = "´";
          else this.tiles[index].character = ".";
          this.tiles[index].color = Colors.WALL;
        }
      }
    }
  }

  addActors(room: Rectangle) {
    let numberOfMonsters = random.getInt(0, this.MAX_ROOM_MONSTERS);
    //let numberOfItems = random.getInt(0, this.MAX_ROOM_ITEMS);
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

    /*
    while (numberOfItems > 0) {
      const x = random.getInt(x1, x2);
      const y = random.getInt(y1, y2);
      if (this.canWalk(x, y)) {
        this.additem(x, y);
      }
      numberOfItems--;
    }
    */
  }

  makeHugeRooms(temproom: Rectangle, withActors: boolean, spawnRoom: boolean) {
    const room = new Rectangle(
      temproom.x + 1,
      temproom.y + 1,
      temproom.w,
      temproom.h,
    );

    if (room.w <= 0) room.w = 1;
    if (room.h <= 0) room.h = 1;
    if (room.x <= 0) room.x = 1;
    if (room.y <= 0) room.y = 1;

    this.createRoom(
      room.x,
      room.y,
      room.x + room.w - 2,
      room.y + room.h - 2,
      withActors,
    );

    if (!spawnRoom)
      this.monsterRooms.push(
        new Rectangle(room.x, room.y, room.w - 2, room.h - 2),
      );
  }

  makeRoomsWithCorridors(
    temproom: Rectangle,
    withActors: boolean,
    spawnRoom: boolean,
  ) {
    //console.log(temproom);

    const room = temproom;
    if (room.w <= 0) room.w = 1;
    if (room.h <= 0) room.h = 1;
    if (room.x <= 0) room.x = 1;
    if (room.y <= 0) room.y = 1;

    this.createRoom(
      room.x,
      room.y,
      room.x + room.w - 2,
      room.y + room.h - 2,
      withActors,
    );

    if (!spawnRoom)
      this.monsterRooms.push(
        new Rectangle(room.x, room.y, room.w - 2, room.h - 2),
      );
  }

  createRoom(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    withActors: boolean,
  ) {
    this.dig(x1, y1, x2, y2, withActors);

    const roomType = random.getInt(0, 4);

    //storage room
    if (roomType === 0) {
      console.log("storage room");
      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          //const index = x + y * this.width;
          if (y === y1 || y === y2 || x === x1 || x === x2) {
            if (random.getInt(0, 100) > 95) {
              /*
              this.tiles[index].character = "O"; //barrel
              this.tiles[index].canWalk = true;
              this.tiles[index].color = Colors.TORCH;
              */
              if (withActors) {
                const barrel = new Actor(x, y, "O", "barrel", "#ffaa00");
                barrel.container = new Container(10);
                barrel.abilities = new Abilities(1, 1, 1, 1, 1);
                if (random.getInt(0, 10) > 5)
                  barrel.container.add(
                    createItem({ name: "health potion", x, y }),
                  );
                if (random.getInt(0, 10) > 8)
                  barrel.container.add(
                    createItem({ name: "nutella bun", x, y }),
                  );
                if (random.getInt(0, 10) > 7)
                  barrel.container.add(
                    createItem({ name: "scroll of fireball", x, y }),
                  );
                if (random.getInt(0, 10) > 8)
                  barrel.container.add(
                    createItem({ name: "scroll of confusion", x, y }),
                  );
                if (random.getInt(0, 10) > 8)
                  barrel.container.add(
                    createItem({ name: "scroll of map", x, y }),
                  );
                if (random.getInt(0, 10) > 7)
                  barrel.container.add(
                    createItem({ name: "scroll of lighting bolt", x, y }),
                  );

                barrel.destructible = new Destructible(
                  10,
                  1,
                  "broken barrel",
                  "",
                  0,
                );

                barrel.blocks = true;
                game.sendToBack(barrel);
              }
            }
          }
        }
      }
    }

    if (roomType === 1) {
      //graveyard/tomb

      if (x2 - x1 > 6 && y2 - y1 > 6) {
        console.log("graveyard/tomb");
        for (let y = y1; y <= y2; y++) {
          for (let x = x1; x <= x2; x++) {
            const index = x + y * this.width;
            if (y >= y1 + 1 && y <= y2 - 1 && x >= x1 + 1 && x <= x2 - 1) {
              if (random.getInt(0, 100) > 20 && x % 2 === 0 && y % 3 === 0) {
                if (withActors) {
                  const actor = new Actor(x, y, "t", "tombstone", "#BBBBBB");
                  actor.blocks = false;
                  game.sendToBack(actor);
                }

                //this.tiles[index].canWalk = true;
                //this.tiles[index].color = Colors.STAIRS;
                if (random.getInt(0, 100) > 50) {
                  this.tiles[index + this.width].color = Colors.SCROLL_OF_MAP;
                  this.tiles[index + this.width].character = "U"; //grave
                }
              }
            }
          }
        }
      }
    }

    if (roomType === 2) {
      //altar
      if (x2 - x1 > 4 && y2 - y1 > 4) {
        console.log("altar");
        for (let i = 0; i < 10; i += 2) {
          //const i = 2;
          for (let y = y1 + i; y <= y2 - i; y++) {
            for (let x = x1 + i; x <= x2 - i; x++) {
              const index = x + y * this.width;
              if (
                y === y1 + i ||
                y === y2 - i ||
                x === x1 + i ||
                x === x2 - i
              ) {
                if (y === y1 + i || y === y2 - i) {
                  this.tiles[index].character = "-";
                } else if (x === x1 + i || x === x2 - i) {
                  this.tiles[index].character = "|";
                } else {
                  this.tiles[index].character = "+";
                }

                this.tiles[index].color = Colors.WALL;

                if (
                  (x === x1 + 2 && y == y1 + 2) ||
                  (x === x2 - 2 && y == y1 + 2) ||
                  (x === x1 + 2 && y == y2 - 2) ||
                  (x === x2 - 2 && y == y2 - 2)
                ) {
                  this.tiles[index].character = "#";
                  this.tiles[index].canWalk = false;
                }
              }
            }
          }
        }
      }
    }

    /*
    for (let y = y1 - 1; y < y2 + 1; y++) {
      for (let x = x1 - 1; x < x2 + 1; x++) {
        if (this.isWall(x, y)) {
          const index = x + y * this.width;
          if (x === x1 - 1 && y === y1 + 1) this.tiles[index].character = "+";
          else if (x === x2 && y === y1 + 1) this.tiles[index].character = "+";
          else if (x === x1 - 1 || x === x2 + 1)
            this.tiles[index].character = "|";
          else if (y === y1 - 1 || y == y2 + 1)
            this.tiles[index].character = "-";
        }
      }
    }
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

  howManyWalls2(x: number, y: number): number {
    if (x > 0 && y > 0 && x < this.width - 1 && y < this.height - 1) {
      let count = 0;
      for (let lx = x - 1; lx <= x + 1; lx++)
        for (let ly = y - 1; ly <= y + 1; ly++)
          if (this.noisemap[lx + ly * this.width] === 1) count++;

      return count;
    }

    return 0;
  }

  //fill with default walls
  fillWithWalls() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = x + y * this.width;
        this.tiles[index].canWalk = false;
        this.tiles[index].color = Colors.WALL;
        this.tiles[index].character = "#";
      }
    }
  }

  generate(withActors: boolean, seed: number, depth: number) {
    this.levelSeed = seed;
    this.depth = depth;

    random.setSeed(this.levelSeed + depth * 25);

    const maxSplitLevel = random.getInt(4, 8);
    console.log("seed: " + this.levelSeed);
    console.log("depth: " + this.depth);
    console.log("split level:" + maxSplitLevel);

    const corridors = [];

    this.ambienceColor =
      Colors.AMBIENCE_COLOR[random.getInt(0, Colors.AMBIENCE_COLOR.length)];

    this.tiles = new Array(this.width * this.height).fill(false);

    for (let i = 0; i < this.width * this.height; i++)
      this.tiles[i] = new Tile();

    const root = new bspGenerator(0, 0, this.width, this.height, maxSplitLevel);
    const option = random.getInt(0, 100) > 70 ? 1 : 2;
    console.log("option: " + option);

    //lets create every room one by one
    let lastx = 0;
    let lasty = 0;
    //take one room and make it spawn room
    const spawnRoomIndex = random.getInt(0, root.rooms.length - 1);
    let stairsRoomIndex = random.getInt(0, root.rooms.length - 1);
    while (true) {
      if (stairsRoomIndex === spawnRoomIndex)
        stairsRoomIndex = random.getInt(0, root.rooms.length - 1);
      else break;
    }

    this.fillWithWalls();

    for (let i = 0; i < root.rooms.length; i++) {
      const temproom = root.rooms[i];
      const spawnRoom = i === spawnRoomIndex ? true : false;

      //option 1
      if (option === 1) {
        this.makeHugeRooms(temproom, withActors, spawnRoom);
      }

      //option 2
      if (option === 2) {
        temproom.w = random.getInt(this.ROOM_MIN_SIZE, temproom.w - 2);
        temproom.h = random.getInt(this.ROOM_MIN_SIZE, temproom.h - 2);
        temproom.x =
          random.getInt(temproom.x, temproom.x + temproom.w - temproom.w) + 1;
        temproom.y =
          random.getInt(temproom.y, temproom.y + temproom.h - temproom.h) + 1;

        this.makeRoomsWithCorridors(temproom, withActors, spawnRoom);
      }

      if (i === spawnRoomIndex) {
        this.startX = temproom.x + float2int(temproom.w / 2);
        this.startY = temproom.y + float2int(temproom.h / 2);
      }
      if (i === stairsRoomIndex) {
        this.stairsX = float2int(temproom.x + temproom.w / 2);
        this.stairsY = float2int(temproom.y + temproom.h / 2);
      }

      if (option === 1 || option === 2) {
        if (i > 0) {
          corridors.push(
            new Rectangle(lastx, lasty, temproom.x + temproom.w / 2, lasty),
          );
          corridors.push(
            new Rectangle(
              temproom.x + temproom.w / 2,
              lasty,
              temproom.x + temproom.w / 2,
              temproom.y + temproom.h / 2,
            ),
          );
        }
        lastx = temproom.x + temproom.w / 2;
        lasty = temproom.y + temproom.h / 2;
      }
    }

    if (maxSplitLevel > 5 || option !== 1)
      if (random.getInt(0, 100) > 30) this.makeCaverns();

    for (let l = 0; l < corridors.length; l++) {
      this.dig(
        corridors[l].x,
        corridors[l].y,
        corridors[l].w,
        corridors[l].h,
        withActors,
      );
    }

    if (withActors) {
      for (const room of this.monsterRooms) this.addActors(room);
      for (const door of this.templateDoors) this.addDoor(door.x, door.y, true);
      for (const room of this.monsterRooms) this.createTorches(room);
    }
  }

  placeWallLogic(x: number, y: number): number {
    const numWalls = this.howManyWalls2(x, y);
    if (this.isWall(x, y)) {
      if (numWalls >= 4) return 1;
      if (numWalls < 2) return 0;
    } else {
      if (numWalls >= 5) return 1;
    }
    return 0;
  }

  makeCaverns() {
    //create noise

    const itermap = new Array(this.width * this.height).fill(0);

    if (random.getInt(0, 100) > 50) {
      console.log("1");
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.noisemap[x + y * this.width] =
            random.getInt(0, 100) < 40 ? 1 : 0;
        }
      }
    } else {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.noisemap[x + y * this.width] = this.isWall(x, y) ? 1 : 0;
        }
      }
    }

    //iterate it (blur it)
    const iterAmount = random.getInt(1, 6);
    console.log("cavern iters: ", iterAmount);
    for (let l = 0; l < iterAmount; l++) {
      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          itermap[x + y * this.width] = this.placeWallLogic(x, y);
        }
      }
      for (let i = 0; i < this.width * this.height; i++) {
        this.noisemap[i] = itermap[i];
      }
    }

    //add to map
    const onlyWalls = random.getInt(0, 100) > 50 ? true : false;
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.isWall(x, y) || onlyWalls) {
          const index = x + y * this.width;
          if (this.noisemap[index] === 0) {
            this.tiles[index].canWalk = true;
            this.tiles[index].character = ".";
          } else {
            this.tiles[index].canWalk = false;
            this.tiles[index].character = "#";
          }
          //noisemap[x + y * this.width] = random.getInt(0, 2);
        }
      }
    }

    //console.log(noisemap);
  }

  createTorches(room: Rectangle) {
    if (room.w >= 3 || room.h >= 3) {
      const torches = [];
      if (this.howManyWalls(room.x, room.y) > 1)
        torches.push(this.addItemWithName("torch", room.x, room.y));
      if (this.howManyWalls(room.x + room.w, room.y) > 1)
        torches.push(this.addItemWithName("torch", room.x + room.w, room.y));
      if (this.howManyWalls(room.x, room.y + room.h) > 1)
        torches.push(this.addItemWithName("torch", room.x, room.y + room.h));
      if (this.howManyWalls(room.x + room.w, room.y + room.h) > 1)
        torches.push(
          this.addItemWithName("torch", room.x + room.w, room.y + room.h),
        );
      //if there's secret, one torch is reversed
      if (torches.length > 0 && this.isThereSecretDoor(room))
        ensure(torches[random.getInt(0, torches.length - 1)]).ch = "í";
    }
  }

  render() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cx = x + game.camera.x;
        const cy = y + game.camera.y;
        if (cx > 0 && cy > 0 && cx < game.width && cy < game.height) {
          const ch = this.tiles[x + y * this.width].character;
          const color = this.tiles[x + y * this.width].color;
          const fovValue = game.player?.fov?.getMapped(x, y);

          if (fovValue === 2 || fovValue === 1) {
            if (fovValue === 2) {
              game.drawChar(ch, cx, cy, color);
            } else {
              game.drawChar(ch, cx, cy, Colors.WALL_DARK);
            }
          }
        }
      }
    }
  }
}
