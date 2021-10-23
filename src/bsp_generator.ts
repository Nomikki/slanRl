"use strict";

import Rectangle from "./rectangle";
import bspNode from "./bsp_node";
import Randomizer from "./random";

const random = new Randomizer();

class bspGenerator {
  maxLevel: number;
  rootContainer: Rectangle;
  rows: number;
  cols: number;
  map: any;
  doorPlaces: any = null;
  tempRooms: any = null;
  rooms: Rectangle[];
  tree: bspNode;

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    maxLevel: number = 5
  ) {
    this.maxLevel = maxLevel;

    this.rootContainer = new Rectangle(x + 1, y + 1, w - 2, h - 2);

    this.rows = h;
    this.cols = w;

    this.map = [];
    this.doorPlaces = [];
    this.tempRooms = []; 

    for (let h = 0; h < this.rows; h++) {
      for (let w = 0; w < this.cols; w++) {
        const index = this.cols * h + w;
        this.map[index] = 1;
      }
    }

    this.tree = this.Devide(this.rootContainer, 0);
    this.rooms = this.tree.GetLeafs();
    this.CreateRooms();
    this.ConnectRooms(this.tree);
  }

  RandomSplit(container: Rectangle) {
    let r1, r2;

    let splitVertical: boolean = random.getInt(0, 1) ? false : true;

    if (container.w > container.h && container.w / container.h >= 0.05) {
      splitVertical = true;
    } else {
      splitVertical = false;
    }

    if (splitVertical) {
      //Vertical
      const w = random.getInt(container.w * 0.3, container.w * 0.6);
      r1 = new Rectangle(container.x, container.y, w, container.h);
      r2 = new Rectangle(
        container.x + w,
        container.y,
        container.w - w,
        container.h
      );
    } else {
      //horizontal
      const h = random.getInt(container.h * 0.3, container.h * 0.6);
      r1 = new Rectangle(container.x, container.y, container.w, h);
      r2 = new Rectangle(
        container.x,
        container.y + h,
        container.w,
        container.h - h
      );
    }
    return [r1, r2];
  }

  Devide(container: Rectangle, level: number): bspNode {
    const root = new bspNode(container);

    if (level < this.maxLevel) {
      const sr = this.RandomSplit(container);
      root.A = this.Devide(sr[0], level + 1);
      root.B = this.Devide(sr[1], level + 1);
    }
    return root;
  }

  CreateRooms() {
    //for (let i = 0; i < this.rooms.length; i++) {
    for (const room of this.rooms) {
      const w = random.getInt(room.w * 0.5, room.w * 0.9);
      const h = random.getInt(room.h * 0.5, room.h * 0.9);
      const x = random.getInt(room.x, room.x + room.w - w);
      const y = random.getInt(room.y, room.y + room.h - h);

      let rect = new Rectangle(x, y, x + w, y + h);
      this.tempRooms.push(rect);

      for (let hi = y; hi < y + h; hi++) {
        for (let wi = x; wi < x + w; wi++) {
          const index = this.cols * hi + wi;
          this.map[index] = 0;
        }
      }
    }
  }

  IsThereRoom(x: number, y: number): boolean {
    for (const room of this.tempRooms) {
      if (x >= room.x && y >= room.y && x <= room.w && y <= room.h) {
        return true;
      }
    }
    return false;
  }

  ConnectRooms(node: bspNode) {
    if (node.A === null || node.B === null) return false;

    const x1 = node.A.leaf.GetCenterX() >> 0;
    const y1 = node.A.leaf.GetCenterY() >> 0;

    const x2 = node.B.leaf.GetCenterX() >> 0;
    const y2 = node.B.leaf.GetCenterY() >> 0;

    let doorsCreated = false;
    let lastWasInRoom = false;

    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      const index = this.cols * Math.max(y1, y2) + x;
      this.map[index] = 0;

      if (!doorsCreated && this.IsThereRoom(x, Math.max(y1, y2)) === true) {
        lastWasInRoom = true;
      } else if (
        !doorsCreated &&
        this.IsThereRoom(x, Math.max(y1, y2)) === false
      ) {
        if (lastWasInRoom === true) {
          doorsCreated = true;
          let re = new Rectangle(x, Math.max(y1, y2), 0, 0);
          this.doorPlaces.push(re);
        }
      }
    }
    doorsCreated = false;

    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      const index = this.cols * y + Math.max(x1, x2);
      this.map[index] = 0;
      if (!doorsCreated && this.IsThereRoom(Math.max(x1, x2), y) === true) {
        lastWasInRoom = true;
      } else if (
        !doorsCreated &&
        this.IsThereRoom(Math.max(x1, x2), y) === false
      ) {
        if (lastWasInRoom === true) {
          doorsCreated = true;
          let re = new Rectangle(Math.max(x1, x2), y, 0, 0);
          this.doorPlaces.push(re);
        }
      }
    }

    this.ConnectRooms(node.A);
    this.ConnectRooms(node.B);
  }
}

export default bspGenerator;
