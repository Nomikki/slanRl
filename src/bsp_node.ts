import Rectangle from "./rectangle";

class bspNode extends Rectangle {
  A: any;
  B: any;
  leaf: any;

  constructor(leaf: Rectangle) {
    super(leaf.x, leaf.y, leaf.w, leaf.h);
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
