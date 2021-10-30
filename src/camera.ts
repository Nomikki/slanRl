export class Camera {
  centerX = 0;
  centerY = 0;

  x = 0;
  y = 0;

  setCenter(w: number, h: number) {
    this.centerX = w / 2;
    this.centerY = h / 2;
  }

  compute(targetX: number, targetY: number) {
    this.x = this.centerX - targetX;
    this.y = this.centerY - targetY;
  }
}
