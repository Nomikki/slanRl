"use strict";

import { game } from ".";
import bspGenerator from "./bsp_generator";
import Randomizer from "./random";

const random = new Randomizer();

class Tile {
  constructor() {
    this.canWalk = false;
  }
}

export default class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.constants = Object.freeze({
      ROOM_MAX_SIZE: 12,
      ROOM_MIN_SIZE: 6,
    });

    this.root = null;
  }

  isWall(x, y) {
    //return !this.tiles[x + y * this.width].canWalk;
    const index = x + y * this.width;
    return !this.tiles[index].canWalk;
    //return this.root.map[index];
  }

  setWall(x, y) {
    this.tiles[x + y * this.width].canWalk = false;
  }

  dig(x1, y1, x2, y2) {
    x1 = x1 | 0;
    x2 = x2 | 0;
    y1 = y1 | 0;
    y2 = y2 | 0;

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

    for (let tilex = x1; tilex <= x2; tilex++) {
      for (let tiley = y1; tiley <= y2; tiley++) {
        const index = tilex + tiley * this.width;
        this.tiles[index].canWalk = true;
      }
    }
  }

  createRoom(x1, y1, x2, y2) {
    this.dig(x1, y1, x2, y2);

    if (random.getInt(0, 3) === 0) {
      game.addMonster((x1 + x2) / 2, (y1 + y2) / 2);
    }
  }

  generate(seed) {
    random.setSeed(seed);
    this.root = new bspGenerator(0, 0, this.width, this.height, 5);
    this.tiles = new Array(this.width * this.height).fill(false);

    const option = 1;

    for (let i = 0; i < this.width * this.height; i++) {
      this.tiles[i] = new Tile();

      //we can use path/room data directly from bsp if we want.
      if (option === 0) this.tiles[i].canWalk = !this.root.map[i];
    }

    //lets create every room one by one
    let lastx = 0;
    let lasty = 0;
    let x = 0;
    let y = 0;
    let w = 0;
    let h = 0;
    for (let i = 0; i < this.root.rooms.length; i++) {
      const room = this.root.rooms[i];

      //option 1
      if (option === 1) {
        w = room.w;
        h = room.h;
        x = room.x + 1;
        y = room.y + 1;

        this.createRoom(x, y, x + w - 2, y + h - 2);
      }

      //option 2
      if (option === 2) {
        w = random.getInt(this.constants.ROOM_MIN_SIZE, room.w - 2);
        h = random.getInt(this.constants.ROOM_MIN_SIZE, room.h - 2);
        x = random.getInt(room.x, room.x + room.w - w - 0) + 1;
        y = random.getInt(room.y, room.y + room.h - h - 0) + 1;

        this.createRoom(x, y, x + w - 2, y + h - 2);
      }

      if (option === 1 || option === 2) {
        if (i > 0) {
          this.dig(lastx, lasty, x + w / 2, lasty);
          this.dig(x + w / 2, lasty, x + w / 2, y + h / 2);
        }
        lastx = x + w / 2;
        lasty = y + h / 2;
      }
    }
  }

  render() {
    const darkWall = "#";
    const darkGround = " ";

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        game.drawChar(this.isWall(x, y) ? darkWall : darkGround, x, y, "#AAA");
      }
    }
  }
}
