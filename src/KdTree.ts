import { KdNode } from './KdNode';
import { PriorityQueue } from './PriorityQueue';

class KdTree<T> {
  points: T[];
  distanceFn: (a: T, b: T) => number;
  dimensions: (keyof T | ((p: T) => number))[];
  maxVariance: boolean;
  root: KdNode<T> | null;

  constructor(
    points: T[],
    distanceFn: (a: T, b: T) => number,
    dimensions: ((keyof T) | ((p: T) => number))[],
    options?: {
      maxVariance?: boolean
    }
  ) {
    this.points = [...points];
    this.distanceFn = distanceFn;
    this.dimensions = dimensions;
    this.maxVariance = options?.maxVariance ?? false;
    this.root = this.maxVariance
      ? this.generateTreeByMaxVariance(this.points, null)
      : this.generateTreeByIndex(this.points, 0, null);
  }

  // If original tree was built by max-variance algorithm, this function may break that structure.
  insert(point: T): void {
    const [parentNode, leftOrRight] = this.searchNearestLeafNode(point, this.root);

    if (parentNode === null) {
      this.root = new KdNode(point, null, null, null, 0);
      return;
    }

    const newNode = new KdNode(
      point,
      null,
      null,
      parentNode,
      (parentNode.splitIndex + 1) % this.dimensions.length
    );
    if (leftOrRight === 0) { // left
      parentNode.left = newNode;
    }
    else { // right
      parentNode.right = newNode;
    }

    // maintian points array
    this.points.push(point);
  }

  // Remove the first point that equalFn returns true.
  // And this function may also disimprove original tree.
  remove(point: T): void {
    const node = this.searchNode(point, this.root);

    if (node === null) return;

    const data = node.data;
    const dataIndex = this.points.findIndex((p) => this.isDataEqual(p, data));

    if (dataIndex < 0) return;

    // maintian points array
    this.points.splice(dataIndex, 1);

    this.removeNode(node);
  }

  //
  getNearestByCount(point: T, count: number): { data: T; distance: number; }[] {
    if (this.root === null || count < 1) return [];

    // search queue
    const queue = new PriorityQueue<T>((a, b) => a.distance - b.distance);
    // nearest queue
    const neighours = new PriorityQueue<T>((a, b) => b.distance - a.distance);

    //
    const getDist = (node: KdNode<T>) => {
      return this.distanceFn(point, node.data);
    }

    // main
    queue.enqueue({ node: this.root, distance: 0 });

    while (!queue.isEmpty()) {
      const nearestItem = queue.dequeue();

      if (!nearestItem) continue;

      const { node } = nearestItem;
      const dist = getDist(node);

      // update nearest queue
      if (
        neighours.size() < count
        || dist < (neighours.peek()?.distance ?? Infinity)
      ) {
        neighours.enqueue({ node: node, distance: dist });
        if (neighours.size() > count) {
          neighours.dequeue();
        }
      }

      const dim = this.dimensions[node.splitIndex];
      const diff = this.getValue(point, dim) - this.getValue(node.data, dim);
      const hyperDist = Math.abs(diff);

      const nextBranch = diff < 0 ? node.left : node.right;
      const otherBranch = diff < 0 ? node.right : node.left;

      nextBranch !== null && queue.enqueue({ node: nextBranch, distance: 0 });

      // enqueue if the hypersphere intersects with split line. (prune)
      if (
        otherBranch
        && neighours.peek()
        && (hyperDist < neighours.peek()!.distance)
      ) {
        queue.enqueue({ node: otherBranch, distance: hyperDist });
      }
    }

    const result = neighours
      .getQueue((a, b) => a.distance - b.distance)
      .map((item) => ({
        data: item.node.data,
        distance: item.distance,
      }));

    return result;
  }

  //
  getNearestByDistance(point: T, maxDistance: number): { data: T; distance: number; }[] {
    if (this.root === null || maxDistance < 0) return [];

    // search queue
    const queue = new PriorityQueue<T>((a, b) => a.distance - b.distance);
    // 
    const result: { data: T; distance: number; }[] = [];

    //
    const getDist = (node: KdNode<T>) => {
      return this.distanceFn(point, node.data);
    }

    // main
    queue.enqueue({ node: this.root, distance: 0 });

    while (!queue.isEmpty()) {
      const nearestItem = queue.dequeue();

      if (!nearestItem) continue;

      const { node } = nearestItem;
      const dist = getDist(node);

      // update nearest queue
      if (dist <= maxDistance) {
        result.push({ data: node.data, distance: dist });
      }

      const dim = this.dimensions[node.splitIndex];
      const diff = this.getValue(point, dim) - this.getValue(node.data, dim);
      const hyperDist = Math.abs(diff);

      const nextBranch = diff < 0 ? node.left : node.right;
      const otherBranch = diff < 0 ? node.right : node.left;

      nextBranch !== null && queue.enqueue({ node: nextBranch, distance: 0 });

      // enqueue if the hypersphere intersects with split line. (prune)
      if (otherBranch && hyperDist <= maxDistance) {
        queue.enqueue({ node: otherBranch, distance: hyperDist });
      }
    }

    result.sort((a, b) => a.distance - b.distance);

    return result;
  }

  //
  rebuild(options?: { maxVariance?: boolean }) {
    this.maxVariance = options?.maxVariance ?? false;
    this.root = this.maxVariance
      ? this.generateTreeByMaxVariance(this.points, null)
      : this.generateTreeByIndex(this.points, 0, null);
  }

  // decide split dimension on index
  protected generateTreeByIndex(
    points: T[],
    depth: number,
    parent: KdNode<T> | null
  ): KdNode<T> | null {
    // 0
    if (points.length === 0) return null;

    const splitIndex = depth % this.dimensions.length;
    const dim = this.dimensions[splitIndex];

    // 1
    if (points.length === 1)
      return new KdNode(points[0], null, null, parent, splitIndex);

    // > 1
    const sortedPoints = points.toSorted(
      (a, b) => this.getValue(a, dim) - this.getValue(b, dim)
    );

    const middeIndex = Math.floor(sortedPoints.length / 2);

    const node = new KdNode(sortedPoints[middeIndex], null, null, parent, splitIndex);
    node.left = this.generateTreeByIndex(sortedPoints.slice(0, middeIndex), depth + 1, node);
    node.right = this.generateTreeByIndex(sortedPoints.slice(middeIndex + 1), depth + 1, node);

    return node;
  }

  // decide split dimension on max variance
  protected generateTreeByMaxVariance(
    points: T[],
    parent: KdNode<T> | null,
  ): KdNode<T> | null {
    // 0
    if (points.length === 0) return null;

    // 1
    if (points.length === 1)
      return new KdNode(points[0], null, null, parent, 0);

    // > 1
    // calc average
    const total = new Array<number>(this.dimensions.length).fill(0);
    // store values to avoid calcuate again
    const valuedPoints: number[][] = [];

    points.forEach((point, i) => {
      this.dimensions.forEach((d, k) => {
        const value = this.getValue(point, d);
        total[k] += value;

        if (valuedPoints[k])
          valuedPoints[k][i] = value;
        else
          valuedPoints[k] = [value];
      });
    });

    const average = total.map((v) => v / points.length);

    // calc variance
    let splitIndex = 0;
    let maxVariance = -1;
    this.dimensions.forEach((d, k) => {
      const ave = average[k];
      const values = valuedPoints[k];
      let variance = 0;

      points.forEach((p, i) => {
        const value = values[i];
        variance += Math.pow(value - ave, 2);
      });

      if (variance > maxVariance) {
        splitIndex = k;
        maxVariance = variance;
      }
    });

    const dim = this.dimensions[splitIndex];

    const sortedPoints = points.toSorted(
      (a, b) => this.getValue(a, dim) - this.getValue(b, dim)
    );

    const middeIndex = Math.floor(sortedPoints.length / 2);

    const node = new KdNode(sortedPoints[middeIndex], null, null, parent, splitIndex);
    node.left = this.generateTreeByMaxVariance(sortedPoints.slice(0, middeIndex), node);
    node.right = this.generateTreeByMaxVariance(sortedPoints.slice(middeIndex + 1), node);

    return node;
  }

  //
  protected getValue(
    point: T,
    dimension: (keyof T) | ((p: T) => number)
  ): number {
    return typeof dimension === 'function'
      ? dimension(point)
      : point[dimension] as number;
  }

  /**
   * @returns [nearestNode, leftOrRight]
   * leftOrRight: 0 -> left , 1 -> right
   */
  protected searchNearestLeafNode(
    point: T,
    node: KdNode<T> | null
  ): [KdNode<T> | null, 0 | 1] {
    if (node === null) return [null, 0];

    const dim = this.dimensions[node.splitIndex];

    if (this.getValue(point, dim) < this.getValue(node.data, dim)) {
      return node.left === null ? [node, 0] : this.searchNearestLeafNode(point, node.left);
    }
    return node.right === null ? [node, 1] : this.searchNearestLeafNode(point, node.right);
  }

  // Only compare keys in dimensions.
  protected isDataEqual(p1: T, p2: T): boolean {
    for (let i = 0; i < this.dimensions.length; i++) {
      const dim = this.dimensions[i];
      if (this.getValue(p1, dim) !== this.getValue(p2, dim)) {
        return false;
      }
    }
    return true;
  }

  //
  protected searchNode(
    point: T,
    node: KdNode<T> | null
  ): KdNode<T> | null {
    if (node === null) return null;

    if (this.isDataEqual(point, node.data)) return node;

    const dim = this.dimensions[node.splitIndex];

    if (this.getValue(point, dim) < this.getValue(node.data, dim)) {
      return this.searchNode(point, node.left);
    }
    return this.searchNode(point, node.right);
  }

  // Find the minimun kd-node of the specified dimension.
  protected findMinNode(
    node: KdNode<T> | null,
    splitIndex: number
  ): KdNode<T> | null {
    if (node === null) return null;

    if (node.splitIndex === splitIndex) {
      if (node.left === null) return node;
      return this.findMinNode(node.left, splitIndex);
    }

    const dim = this.dimensions[splitIndex];

    const leftMinNode = this.findMinNode(node.left, splitIndex);
    const rightMinNode = this.findMinNode(node.right, splitIndex);
    let minNode = node;

    if (
      leftMinNode !== null
      && this.getValue(leftMinNode.data, dim) < this.getValue(minNode.data, dim)
    ) {
      minNode = leftMinNode;
    }
    if (
      rightMinNode !== null
      && this.getValue(rightMinNode.data, dim) < this.getValue(minNode.data, dim)
    ) {
      minNode = rightMinNode;
    }

    return minNode;
  }

  //
  protected removeNode(node: KdNode<T> | null): void {
    if (node === null) return;

    // If node is a root/leaf node, just remove it directly.
    if (node.isLeaf()) {
      // root
      if (node.parent === null) {
        this.root = null;
        return;
      }

      // leaf
      if (node.parent.left === node) {
        node.parent.left = null;
      }
      else {
        node.parent.right = null;
      }

      return;
    }

    // If the right subtree is not empty, swap with the minimum element on the
    // node's dimension. If it is empty, we swap the left and right subtrees and
    // do the same.
    if (node.right !== null) {
      const placeNode = this.findMinNode(node.right, node.splitIndex) as KdNode<T>;
      node.data = placeNode.data;
      this.removeNode(placeNode);
    }
    else {
      const placeNode = this.findMinNode(node.left, node.splitIndex) as KdNode<T>;
      node.data = placeNode.data;
      node.right = node.left;
      node.left = null;
      this.removeNode(placeNode);
    }
  }

}

export { KdTree };