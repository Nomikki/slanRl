"use strict";

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
  }

  clear(color = "#000") {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, 80 * this.fontSize, 40 * this.fontSize);
  }

  drawChar(ch, x, y, color = "#000") {
    this.ctx.fillStyle = color;
    this.ctx.fillText(ch, x * this.fontSize, y * this.fontSize);
  }

  run() {
    this.clear();
    this.drawChar("@", 40, 20, "#AAA");
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

  //just testing
  async hurdur() {
    while (true) {
      let ch = await this.getch();
      console.log("hurdur: " + ch);
      if (ch === "h") break;
    }
  }

  async update() {
    while (true) {
      let ch = await this.getch();
      console.log("1: " + ch);

      if (ch === "a") break;
      if (ch === "i") {
        await this.hurdur();
      }
    }

    console.log("done");
  }
}

const game = new Game();
game.run();
