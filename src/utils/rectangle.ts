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

  GetHalfDimensionX(): number {
    return this.w / 2;
  }

  GetHalfDimensionY(): number {
    return this.h / 2;
  }

  GetCenterX(): number {
    return this.x + this.GetHalfDimensionX();
  }

  GetCenterY(): number {
    return this.y + this.GetHalfDimensionY();
  }
}

export default Rectangle;
