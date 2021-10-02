"use strict";

import { game } from ".";

class Tile {
  constructor() {
    this.canWalk = true;
  }
}

export default class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    //this.tiles = new Array(this.width).fill(false).map(() => new Array(this.height).fill(false));
    this.tiles = new Array(this.width * this.height).fill(false);
    for (let i = 0; i < this.width * this.height; i++)
      this.tiles[i] = new Tile();

    this.setWall(30, 22);
    this.setWall(50, 22);
  }

  isWall(x, y) {
    return !this.tiles[x + y * this.width].canWalk;
  }

  setWall(x, y) {
    this.tiles[x + y * this.width].canWalk = false;
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
