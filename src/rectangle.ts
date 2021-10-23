import { X, Y } from './actor';
import { Height, Width } from './fov';

class Rectangle {
  x: X;
  y: Y;
  w: Width;
  h: Height;

  constructor(x: X, y: Y, w: Width, h: Height) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  GetHalfDimensionX() {
    return this.w / 2;
  }
  GetHalfDimensionY() {
    return this.h / 2;
  }

  GetCenterX() {
    return this.x + this.GetHalfDimensionX();
  }

  GetCenterY() {
    return this.y + this.GetHalfDimensionY();
  }
}

export default Rectangle;
