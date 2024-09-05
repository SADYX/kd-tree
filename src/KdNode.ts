interface KdNodeJson<T> {
  data: T;
  splitIndex: number;
  left: KdNodeJson<T> | null;
  right: KdNodeJson<T> | null;
}

class KdNode<T> {
  data: T;
  left: KdNode<T> | null;
  right: KdNode<T> | null;
  parent: KdNode<T> | null;
  splitIndex: number;

  constructor(
    data: T,
    left: KdNode<T> | null,
    right: KdNode<T> | null,
    parent: KdNode<T> | null,
    splitIndex: number,
  ) {
    this.data = data;
    this.left = left;
    this.right = right;
    this.parent = parent;
    this.splitIndex = splitIndex;
  }

  toJSON(): KdNodeJson<T> {
    return {
      data: this.data,
      splitIndex: this.splitIndex,
      left: this.left?.toJSON() ?? null,
      right: this.right?.toJSON() ?? null,
    }
  }

  isLeaf(): boolean {
    return this.left === null && this.right === null;
  }
}

export { KdNode };
export type { KdNodeJson };