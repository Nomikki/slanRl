import { game } from ".";

export default class Fov {
  height: number;
  mapped: number[];
  width: number;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;

    this.mapped = new Array(this.width * this.height).fill(0);
  }

  clear() {
    for (let i = 0; i < this.width * this.height; i++) {
      if (this.mapped[i] === 2) {
        this.mapped[i] = 1;
      }
    }
  }

  fullClear() {
    this.mapped = new Array(this.width * this.height).fill(0);
  }

  float2int(value: number): number {
    return value | 0;
  }

  /* Just a placeholder */
  compute(x: number, y: number, len: number) {
    this.clear();

    let dx = 0;
    let dy = 0;
    let px = 0;
    let py = 0;

    this.mapped[x + y * this.width] = 2;

    for (let a = 0; a < 360; a++) {
      dx = Math.sin((a / 3.1415) * 180.0);
      dy = Math.cos((a / 3.1415) * 180.0);

      px = x + 0.5;
      py = y + 0.5;

      for (let l = 0; l < len; l++) {
        px += dx;
        py += dy;

        if (px <= 0 || px >= this.width || py <= 0 || py >= this.height) {
          break;
        }

        const id = this.float2int(px) + this.float2int(py) * this.width;
        this.mapped[id] = 2;

        if (game.map?.isWall(this.float2int(px), this.float2int(py)) === true) {
          break;
        }
      }
    }
  }

  getMapped(x: number, y: number): number {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height)
      return this.mapped[x + y * this.width];
    else return 2;
  }

  isInFov(x: number, y: number): boolean {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
      return this.mapped[x + y * this.width] > 0;
    }

    return false;
  }
}
