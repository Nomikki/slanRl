class Rectangle {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(x: number, y: number, w: number, h: number) {
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
