import { game } from "../.";
import { float2int } from "../utils/utils";

export default class Fov {
  width: number;
  height: number;
  mapped: number[];

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

        const id = float2int(px) + float2int(py) * this.width;
        this.mapped[id] = 2;

        if (!game.map?.canWalk(float2int(px), float2int(py))) {
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
