import { game } from "@/index";
import { ensure, float2int, hexToRGB } from "@/utils";

export class LightingColor {
  r = 0;
  g = 0;
  b = 0;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

interface positionInterface {
  x: number;
  y: number;
  colorR: number;
  colorG: number;
  colorB: number;

  size: number;
}

export default class Fov {
  width: number;
  height: number;
  mapped: number[];
  light: number[];
  lightColor: LightingColor[] = [];
  lightPositions: positionInterface[];

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;

    this.mapped = new Array(this.width * this.height).fill(0);
    this.light = new Array(this.width * this.height).fill(0);

    for (let i = 0; i < this.width * this.height; i++) {
      this.lightColor.push(new LightingColor(0, 0, 0));
    }
    this.lightPositions = [];
    /*
    this.lightColor = new Array(this.width * this.height).fill(
      new LightingColor(0, 0, 0),
    );
    */
  }

  clear() {
    for (let i = 0; i < this.width * this.height; i++) {
      if (this.mapped[i] === 2) {
        this.mapped[i] = 1;
        this.light[i] = 128;
      }
    }
  }

  fullClear() {
    this.mapped = new Array(this.width * this.height).fill(0);
    this.light = new Array(this.width * this.height).fill(0);
  }

  showAll() {
    this.mapped = new Array(this.width * this.height).fill(2);
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (game.map?.isWall(x, y) == true) {
          let walls = 0;
          if (game.map?.isWall(x - 1, y)) walls++;
          if (game.map?.isWall(x + 1, y)) walls++;
          if (game.map?.isWall(x, y - 1)) walls++;
          if (game.map?.isWall(x, y + 1)) walls++;

          if (game.map?.isWall(x - 1, y + 1)) walls++;
          if (game.map?.isWall(x + 1, y + 1)) walls++;

          if (game.map?.isWall(x - 1, y - 1)) walls++;
          if (game.map?.isWall(x + 1, y - 1)) walls++;

          if (walls >= 8) {
            const id = float2int(x) + float2int(y) * this.width;
            this.mapped[id] = 0;
          }
        }
      }
    }
  }

  computeLightSource(source: positionInterface) {
    let dx = 0;
    let dy = 0;
    let px = 0;
    let py = 0;

    if (!this.lightColor) return;

    //console.log(this.lightColor);

    for (let a = 0; a < 360; a++) {
      dx = Math.sin((a / 3.1415) * 180.0);
      dy = Math.cos((a / 3.1415) * 180.0);

      px = source.x + 0.5;
      py = source.y + 0.5;

      const len = source.size;

      for (let l = 1; l < len; l++) {
        if (px <= 0 || px >= this.width || py <= 0 || py >= this.height) {
          break;
        }

        const id = float2int(float2int(px) + float2int(py) * this.width);

        //console.log(px, py);
        const c = 1.0 / (l + 1);
        this.lightColor[id].r += source.colorR * c * 0.02;
        this.lightColor[id].g += source.colorG * c * 0.02;
        this.lightColor[id].b += source.colorB * c * 0.02;
        if (this.lightColor[id].r > 255) this.lightColor[id].r = 255;
        if (this.lightColor[id].g > 255) this.lightColor[id].g = 255;
        if (this.lightColor[id].b > 255) this.lightColor[id].b = 255;

        if (this.lightColor[id].r > 255) this.lightColor[id].r = 255;
        if (this.lightColor[id].g > 255) this.lightColor[id].g = 255;
        if (this.lightColor[id].b > 255) this.lightColor[id].b = 255;

        if (game.map?.isWall(float2int(px), float2int(py))) {
          this.lightColor[id].r = 0;
          this.lightColor[id].g = 0;
          this.lightColor[id].b = 0;

          break;
        }

        px += dx;
        py += dy;
      }
    }
  }

  computeLights() {
    //for (const c of this.lightColor) c.r = c.g = c.b = 0;

    //little optimization;
    /*
      dont compute lights if there is no need update
      Only if amount of light or sources or positions is changed
    */
    let lightsAmount = 0;

    for (const c of game.actors) {
      if (c.emitLight === true) lightsAmount++;
    }

    let needUpdate = false;

    if (lightsAmount !== this.lightPositions.length) {
      this.lightPositions = [];
      needUpdate = true;
      for (const c of game.actors) {
        const [r, g, b] = hexToRGB(c.color);
        if (c.emitLight === true) {
          const p: positionInterface = {
            x: c.x,
            y: c.y,
            colorR: r,
            colorG: g,
            colorB: b,
            size: c.fovLen,
          };

          this.lightPositions.push(p);
        }
      }
    }

    let a = 0;
    for (let i = 0; i < game.actors.length; i++) {
      if (game.actors[i].emitLight === true) {
        if (
          game.actors[i].x !== this.lightPositions[a].x ||
          game.actors[i].y !== this.lightPositions[a].y
        ) {
          needUpdate = true;
          break;
        }
        a++;
      }
    }

    if (needUpdate) {
      const [ambR, ambG, ambB] = hexToRGB(ensure(game.map?.ambienceColor));

      for (const c of this.lightColor) {
        c.r = float2int(ambR * 0.1);
        c.g = float2int(ambG * 0.1);
        c.b = float2int(ambB * 0.1);
      }

      for (const c of this.lightPositions) {
        this.computeLightSource(c);
      }
    }

    /*
    if (game.player) {
      this.computeLightSource(game.player);
    }
    */

    //console.log(this.lightColor);
  }

  /* Just a placeholder */
  compute(x: number, y: number, len: number) {
    this.clear();

    let dx = 0;
    let dy = 0;
    let px = 0;
    let py = 0;

    this.mapped[x + y * this.width] = 2;
    this.light[x + y * this.width] = 0;

    for (let a = 0; a < 360; a++) {
      dx = Math.sin((a / 3.1415) * 180.0);
      dy = Math.cos((a / 3.1415) * 180.0);

      px = x + 0.5;
      py = y + 0.5;

      let powerOfLight = len / 2;

      for (let l = 0; l < len; l++) {
        px += dx;
        py += dy;

        if (px <= 0 || px >= this.width || py <= 0 || py >= this.height) {
          break;
        }

        const id = float2int(px) + float2int(py) * this.width;
        this.mapped[id] = 2;
        this.light[id] = float2int(l * (128 / len));
        if (this.light[id] < 0) this.light[id] = 0;
        if (this.light[id] > 512) this.light[id] = 512;

        if (!game.map?.canWalk(float2int(px), float2int(py))) {
          break;
        }

        powerOfLight = this.getLightValue(float2int(px), float2int(py)) / 255;
        if (powerOfLight < 0.1 && l > len / 2) {
          this.mapped[id] = 0;
        }
        //powerOfLight--;
        //if (powerOfLight < 0) break;
      }
    }
  }

  getMapped(x: number, y: number): number {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height)
      return this.mapped[x + y * this.width];
    else return 2;
  }

  getAmbienceLight(x: number, y: number): number {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height)
      return this.light[x + y * this.width];
    else return 0;
  }

  getLight(x: number, y: number): LightingColor {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height)
      return this.lightColor[x + y * this.width];
    else return { r: 0, g: 0, b: 0 };
  }

  getLightValue(x: number, y: number): number {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
      const r = this.lightColor[x + y * this.width].r;
      const g = this.lightColor[x + y * this.width].g;
      const b = this.lightColor[x + y * this.width].b;

      return float2int((r + g + b) / 3);
    }

    return 0;
  }

  isInFov(x: number, y: number): boolean {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
      return this.mapped[x + y * this.width] > 1;
    }
    return false;
  }

  /*
  is(x: number, y: number): boolean {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
      return this.mapped[x + y * this.width] > 0;
    }
    return false;
  }
  */
}
