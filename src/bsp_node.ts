import Rectangle from "./rectangle";

export type Leaf = bspNode;

class bspNode extends Rectangle {
  A?: bspNode;
  B?: bspNode;
  leaf: Rectangle;

  constructor(leaf: Rectangle) {
    super(leaf.x, leaf.y, leaf.w, leaf.h);
    this.leaf = leaf;
  }

  GetLeafs(): bspNode[] | Rectangle[] {
    if (!this.A || !this.B) {
      return [this.leaf];
    } else {
      return [...this.A.GetLeafs(), ...this.B.GetLeafs()];
    }
  }
}

export default bspNode;
