"use strict";

import Actor from "./actor";
import Map from "./map";

class Game {
  constructor() {
    this.init();
  }

  init() {
    this.canvas = document.getElementById("screen");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "16px Arial";
    this.fontSize = 16;
    this.lastKey = 0;

    this.width = 80;
    this.height = 40;

    this.actors = new Array();
    this.actors.push(new Actor(1, 1, "@", "#00FF00"));
    this.actors.push(new Actor(10, 8, "@", "#FFAA00"));

    this.player = this.actors[0];
    this.map = new Map(this.width, this.height);
  }

  clear(color = "#000") {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      0,
      0,
      this.width * this.fontSize,
      this.height * this.fontSize
    );
  }

  drawChar(ch, x, y, color = "#000") {
    this.ctx.fillStyle = color;
    this.ctx.fillText(ch, x * this.fontSize, y * this.fontSize);
  }

  run() {
    this.render();
    this.update();
  }

  waitingKeypress() {
    return new Promise((resolve) => {
      document.addEventListener("keydown", onKeyHandler);
      function onKeyHandler(e) {
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
    this.lastKey = 0;
    return tempKey;
  }

  render() {
    this.clear();

    this.map.render();
    this.drawChar("@", this.playerX, this.playerY, "#AAA");

    for (let i = 0; i < this.actors.length; i++) this.actors[i].render();
  }

  /*
  //just testing
  async hurdur() {
    while (true) {
      let ch = await this.getch();
      console.log("hurdur: " + ch);
      if (ch === "h") break;
    }
  }
  */

  async update() {
    while (true) {
      const ch = await this.getch();
      //console.log("ch " + ch);

      let dx = 0;
      let dy = 0;

      if (ch === "ArrowLeft") dx--;
      if (ch === "ArrowRight") dx++;
      if (ch === "ArrowUp") dy--;
      if (ch === "ArrowDown") dy++;

      if (!this.map.isWall(this.player.x + dx, this.player.y + dy)) {
        this.player.x += dx;
        this.player.y += dy;
      }

      //finally draw screen
      this.render();
    }
  }
}

export const game = new Game();
game.run();
