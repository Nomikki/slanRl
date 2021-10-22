import Rectangle from "./rectangle";

export type Leaf = any;

class bspNode extends Rectangle {
  A: bspNode;
  B: bspNode;
  leaf: Leaf;

  constructor(leaf: Leaf) {
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
