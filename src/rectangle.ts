class Rectangle {
  h: number;
  w: number;
  x: number;
  y: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.h = h;
    this.w = w;
    this.x = x;
    this.y = y;
  }

  GetHalfDimensionX(): number {
    return this.w / 2;
  }
  GetHalfDimensionY(): number {
    return this.h / 2;
  }

  GetHalfDimensions(): [width: number, height: number] {
    return [this.GetHalfDimensionX(), this.GetHalfDimensionY()];
  }

  GetCenter(): [x: number, y: number] {
    return [this.GetCenterX() >> 0, this.GetCenterY() >> 0];
  }

  GetCenterX(): number {
    return this.x + this.GetHalfDimensionX();
  }

  GetCenterY(): number {
    return this.y + this.GetHalfDimensionY();
  }
}

export default Rectangle;
