"use strict";

import Actor from "./actor";
import Map from "./map";
import Fov from "./fov";

class Game {
  constructor() {
    this.GameStatus = Object.freeze({
      STARTUP: 0,
      IDLE: 1,
      NEW_TURN: 2,
      VICTORY: 3,
      DEFEAT: 4,
    });

    this.gameStatus = this.GameStatus.STARTUP;
  }

  init() {
    this.canvas = document.getElementById("screen");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "12px Arial";
    this.fontSize = 12;
    this.lastKey = 0;

    this.width = 80;
    this.height = 40;

    this.actors = new Array();
    this.actors.push(new Actor(2, 2, "@", "hero", "#CCC"));

    this.player = this.actors[0];
    this.player.fov = new Fov(this.width, this.height);

    this.map = new Map(this.width, this.height);

    this.map.generate(Math.random() * 32000);
    this.player.x = this.map.startX;
    this.player.y = this.map.startY;
    this.player.fov.fullClear();
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
    this.ctx.fillStyle = "#040404";
    this.ctx.fillRect(
      x * this.fontSize,
      y * this.fontSize,
      this.fontSize,
      this.fontSize
    );

    this.ctx.fillStyle = color;
    this.ctx.fillText(ch, x * this.fontSize, y * this.fontSize + this.fontSize);
  }

  run() {
    this.init();
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
      if (this.gameStatus === this.GameStatus.STARTUP) {
        this.player.computeFov();
        this.render();
      }
      this.gameStatus = this.GameStatus.IDLE;

      const ch = await this.getch();
      //console.log("ch " + ch);

      let dx = 0;
      let dy = 0;

      if (ch === "ArrowLeft") dx--;
      if (ch === "ArrowRight") dx++;
      if (ch === "ArrowUp") dy--;
      if (ch === "ArrowDown") dy++;

      if (dx !== 0 || dy !== 0) {
        this.gameStatus = this.GameStatus.NEW_TURN;

        if (this.player.moveOrAttack(this.player.x + dx, this.player.y + dy)) {
          this.player.computeFov();
        }

        if (this.gameStatus === this.GameStatus.NEW_TURN) {
          for (let i = 0; i < this.actors.length; i++) {
            const actor = this.actors[i];
            if (actor !== this.player) {
              actor.update();
            }
          }
        }

        /*
        if (this.map.canWalk(this.player.x + dx, this.player.y + dy)) {
          this.player.x += dx;
          this.player.y += dy;
        }
        */
      }

      //finally draw screen
      this.render();
    }
  }
}

export const game = new Game();
game.run();
