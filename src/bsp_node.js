"use strict";

import Rectangle from "./rectangle.js";

class bspNode extends Rectangle {
  constructor(leaf) {
    super(leaf);
    this.A = null;
    this.B = null;
    this.leaf = leaf;
  }

  GetLeafs() {
    if (this.A === null && this.B === null) {
      return [this.leaf];
    } else {
      return [].concat(this.A.GetLeafs(), this.B.GetLeafs());
    }
  }
}

export default bspNode;
