"use strict";

import Actor from "./actor";
import Map from "./map";
import Fov from "./fov";
import Destructible, { PlayerDestructible } from "./destructible";
import Attacker from "./attacker";
import { PlayerAI } from "./ai";

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
    this.player.destructible = new PlayerDestructible(30, 2, "your cadaver");
    this.player.attacker = new Attacker(5);
    this.player.ai = new PlayerAI();

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

  drawText(text, x, y, color = "#AAA")
  {
    for (let i = 0; i < text.length; i++)
    {
      this.drawChar(text.charAt(i), x + i, y, color);
    }
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

    this.drawText("HP: " + this.player.destructible.hp + "/" + this.player.destructible.maxHP, 0, this.height-1);
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
    
    while (true)
    {
      if (this.gameStatus === this.GameStatus.STARTUP) {
        this.player.computeFov();
        this.render();
      }
      this.gameStatus = this.GameStatus.IDLE;

      await this.player.update();

      if (this.gameStatus === this.GameStatus.NEW_TURN) {
        for (let i = 0; i < this.actors.length; i++) {
          const actor = this.actors[i];
          if (actor !== this.player) {
            actor.update();
          }
        }
      }
      
      //finally draw screen
      this.render();


      if (this.gameStatus === this.GameStatus.DEFEAT)
      {
        this.drawText("DEFEAT!", this.width / 2 - 3, this.height / 2, "#A00");
        break;
      }
    }
    
  }

  sendToBack(actor) {
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i] === actor) {
        this.actors.splice(i, 1);
        break;
      }
    }
    this.actors.unshift(actor);
  }
}

export const game = new Game();
game.run();
