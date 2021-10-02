"use strict";

import { game } from ".";
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

    //this.tiles = new Array(this.width).fill(false).map(() => new Array(this.height).fill(false));
    this.tiles = new Array(this.width * this.height).fill(false);
    for (let i = 0; i < this.width * this.height; i++)
      this.tiles[i] = new Tile();

      /*
    this.setWall(30, 22);
    this.setWall(50, 22);
    */
   this.createRoom(1, 2, 10, 10);
   this.createRoom(13, 2, 20, 10);
   //this.createRoom(1, 2, 10, 10);
  }

  isWall(x, y) {
    return !this.tiles[x + y * this.width].canWalk;
  }

  setWall(x, y) {
    this.tiles[x + y * this.width].canWalk = false;
  }

  dig(x1, y1, x2, y2) {
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
        this.tiles[tilex + tiley * this.width].canWalk = true;
      }
    }
  }

  createRoom(x1, y1, x2, y2) {
    this.dig(x1, y1, x2, y2);

    if (random.getInt(0, 3) === 0) {
      game.addMonster((x1+x2)/2, (y1+y2)/2);
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
