import Rectangle from "./rectangle";

export type Leaf = bspNode;

class bspNode extends Rectangle {
  A: bspNode | null;
  B: bspNode | null;
  leaf: Rectangle;

  constructor(leaf: Rectangle) {
    super(leaf.x, leaf.y, leaf.w, leaf.h);
    this.A = null;
    this.B = null;
    this.leaf = leaf;
  }

  GetLeafs(): bspNode[] | Rectangle[] {
    if (this.A === null || this.B === null) {
      return [this.leaf];
    } else {
      return [...this.A.GetLeafs(), ...this.B.GetLeafs()];
    }
  }
}

export default bspNode;
