import { KdNode } from "./KdNode";

interface QueueItem<T> {
  node: KdNode<T>;
  distance: number;
}

class PriorityQueue<T> {
  private queue: QueueItem<T>[];
  private compareFn: (a: QueueItem<T>, b: QueueItem<T>) => number;

  constructor(
    compareFn: (a: QueueItem<T>, b: QueueItem<T>) => number
  ) {
    this.queue = [];
    this.compareFn = compareFn;
  }

  //
  enqueue(item: QueueItem<T>): void {
    this.queue.push(item);
    this.siftUp(this.size() - 1);
  }

  //
  dequeue(): QueueItem<T> | null {
    if (this.size() === 0) return null;

    this.swap(0, this.size() - 1);

    const value = this.queue.pop() as QueueItem<T>;

    this.siftDown(0);

    return value;
  }

  //
  peek(): QueueItem<T> | null {
    return this.queue[0] ?? null;
  }

  //
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  //
  size(): number {
    return this.queue.length;
  }

  //
  getQueue(
    sortFn?: (a: QueueItem<T>, b: QueueItem<T>) => number
  ): QueueItem<T>[] {
    return sortFn ? this.queue.sort(sortFn) : this.queue.sort(this.compareFn);
  }

  //
  protected siftUp(index: number) {
    let currentIndex = index;

    while (true) {
      const partentIndex = this.getParentIndex(currentIndex);

      if (
        partentIndex < 0
        || this.compareFn(this.queue[currentIndex], this.queue[partentIndex]) >= 0
      ) break;

      this.swap(currentIndex, partentIndex);

      currentIndex = partentIndex;
    }
  }

  //
  protected siftDown(index: number) {
    let currentIndex = index;

    while (true) {
      const leftIndex = this.getLeftIndex(currentIndex);
      const rightIndex = this.getRightIndex(currentIndex);
      let maxIndex = currentIndex;

      if (
        leftIndex < this.size()
        && this.compareFn(this.queue[leftIndex], this.queue[maxIndex]) < 0
      )
        maxIndex = leftIndex;

      if (
        rightIndex < this.size()
        && this.compareFn(this.queue[rightIndex], this.queue[maxIndex]) < 0
      )
        maxIndex = rightIndex;

      if (maxIndex === currentIndex) break;

      this.swap(currentIndex, maxIndex);

      currentIndex = maxIndex;
    }
  }

  //
  protected getParentIndex(index: number) {
    return Math.floor((index - 1) / 2);
  }

  //
  protected getLeftIndex(index: number) {
    return 2 * index + 1;
  }

  //
  protected getRightIndex(index: number) {
    return 2 * index + 2;
  }

  //
  protected swap(index1: number, index2: number) {
    const temp = this.queue[index1];
    this.queue[index1] = this.queue[index2];
    this.queue[index2] = temp;
  }
}

export { PriorityQueue };
export type { QueueItem };