import { KdNode } from "./KdNode";

interface QueueItem<T> {
  node: KdNode<T>;
  distance: number;
}

class PriorityQueue<T> {
  private queue: QueueItem<T>[];

  constructor() {
    this.queue = [];
  }

  //
  enqueue(item: QueueItem<T>): void {
    this.queue.push(item);
    this.queue.sort((a, b) => a.distance - b.distance);
  }

  //
  dequeue(): QueueItem<T> | null {
    return this.queue.shift() ?? null;
  }

  //
  pop(): QueueItem<T> | null {
    return this.queue.pop() ?? null;
  }

  //
  peek(): QueueItem<T> | null {
    return this.queue[0] ?? null;
  }

  //
  peekEnd(): QueueItem<T> | null {
    return this.queue.at(-1) ?? null;
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
  getQueue(): QueueItem<T>[] {
    return this.queue;
  }
}

export { PriorityQueue };
export type { QueueItem };