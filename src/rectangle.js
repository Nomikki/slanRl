"use strict";

class Rectangle {
  constructor(x, y, w, h) {
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
