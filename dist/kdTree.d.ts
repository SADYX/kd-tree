declare module "KdNode" {
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
        constructor(data: T, left: KdNode<T> | null, right: KdNode<T> | null, parent: KdNode<T> | null, splitIndex: number);
        toJSON(): KdNodeJson<T>;
        isLeaf(): boolean;
    }
    export { KdNode };
    export type { KdNodeJson };
}
declare module "PriorityQueue" {
    import { KdNode } from "KdNode";
    interface QueueItem<T> {
        node: KdNode<T>;
        distance: number;
    }
    class PriorityQueue<T> {
        private queue;
        private compareFn;
        constructor(compareFn: (a: QueueItem<T>, b: QueueItem<T>) => number);
        enqueue(item: QueueItem<T>): void;
        dequeue(): QueueItem<T> | null;
        peek(): QueueItem<T> | null;
        isEmpty(): boolean;
        size(): number;
        getQueue(sortFn?: (a: QueueItem<T>, b: QueueItem<T>) => number): QueueItem<T>[];
        protected siftUp(index: number): void;
        protected siftDown(index: number): void;
        protected getParentIndex(index: number): number;
        protected getLeftIndex(index: number): number;
        protected getRightIndex(index: number): number;
        protected swap(index1: number, index2: number): void;
    }
    export { PriorityQueue };
    export type { QueueItem };
}
declare module "KdTree" {
    import { KdNode } from "KdNode";
    class KdTree<T> {
        points: T[];
        distanceFn: (a: T, b: T) => number;
        dimensions: (keyof T | ((p: T) => number))[];
        maxVariance: boolean;
        root: KdNode<T> | null;
        constructor(points: T[], distanceFn: (a: T, b: T) => number, dimensions: ((keyof T) | ((p: T) => number))[], options?: {
            maxVariance?: boolean;
        });
        insert(point: T): void;
        remove(point: T): void;
        getNearestByCount(point: T, count: number): {
            data: T;
            distance: number;
        }[];
        getNearestByDistance(point: T, maxDistance: number): {
            data: T;
            distance: number;
        }[];
        rebuild(options?: {
            maxVariance?: boolean;
        }): void;
        protected generateTreeByIndex(points: T[], depth: number, parent: KdNode<T> | null): KdNode<T> | null;
        protected generateTreeByMaxVariance(points: T[], parent: KdNode<T> | null): KdNode<T> | null;
        protected getValue(point: T, dimension: (keyof T) | ((p: T) => number)): number;
        /**
         * @returns [nearestNode, leftOrRight]
         * leftOrRight: 0 -> left , 1 -> right
         */
        protected searchNearestLeafNode(point: T, node: KdNode<T> | null): [KdNode<T> | null, 0 | 1];
        protected isDataEqual(p1: T, p2: T): boolean;
        protected searchNode(point: T, node: KdNode<T> | null): KdNode<T> | null;
        protected findMinNode(node: KdNode<T> | null, splitIndex: number): KdNode<T> | null;
        protected removeNode(node: KdNode<T> | null): void;
    }
    export { KdTree };
}
declare module "index" {
    export { KdTree } from "KdTree";
}
