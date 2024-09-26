define("KdNode", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KdNode = void 0;
    class KdNode {
        data;
        left;
        right;
        parent;
        splitIndex;
        constructor(data, left, right, parent, splitIndex) {
            this.data = data;
            this.left = left;
            this.right = right;
            this.parent = parent;
            this.splitIndex = splitIndex;
        }
        toJSON() {
            return {
                data: this.data,
                splitIndex: this.splitIndex,
                left: this.left?.toJSON() ?? null,
                right: this.right?.toJSON() ?? null,
            };
        }
        isLeaf() {
            return this.left === null && this.right === null;
        }
    }
    exports.KdNode = KdNode;
});
define("PriorityQueue", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PriorityQueue = void 0;
    class PriorityQueue {
        queue;
        compareFn;
        constructor(compareFn) {
            this.queue = [];
            this.compareFn = compareFn;
        }
        //
        enqueue(item) {
            this.queue.push(item);
            this.siftUp(this.size() - 1);
        }
        //
        dequeue() {
            if (this.size() === 0)
                return null;
            this.swap(0, this.size() - 1);
            const value = this.queue.pop();
            this.siftDown(0);
            return value;
        }
        //
        peek() {
            return this.queue[0] ?? null;
        }
        //
        isEmpty() {
            return this.queue.length === 0;
        }
        //
        size() {
            return this.queue.length;
        }
        //
        getQueue(sortFn) {
            return sortFn ? this.queue.sort(sortFn) : this.queue.sort(this.compareFn);
        }
        //
        siftUp(index) {
            let currentIndex = index;
            while (true) {
                const partentIndex = this.getParentIndex(currentIndex);
                if (partentIndex < 0
                    || this.compareFn(this.queue[currentIndex], this.queue[partentIndex]) >= 0)
                    break;
                this.swap(currentIndex, partentIndex);
                currentIndex = partentIndex;
            }
        }
        //
        siftDown(index) {
            let currentIndex = index;
            while (true) {
                const leftIndex = this.getLeftIndex(currentIndex);
                const rightIndex = this.getRightIndex(currentIndex);
                let maxIndex = currentIndex;
                if (leftIndex < this.size()
                    && this.compareFn(this.queue[leftIndex], this.queue[maxIndex]) < 0)
                    maxIndex = leftIndex;
                if (rightIndex < this.size()
                    && this.compareFn(this.queue[rightIndex], this.queue[maxIndex]) < 0)
                    maxIndex = rightIndex;
                if (maxIndex === currentIndex)
                    break;
                this.swap(currentIndex, maxIndex);
                currentIndex = maxIndex;
            }
        }
        //
        getParentIndex(index) {
            return Math.floor((index - 1) / 2);
        }
        //
        getLeftIndex(index) {
            return 2 * index + 1;
        }
        //
        getRightIndex(index) {
            return 2 * index + 2;
        }
        //
        swap(index1, index2) {
            const temp = this.queue[index1];
            this.queue[index1] = this.queue[index2];
            this.queue[index2] = temp;
        }
    }
    exports.PriorityQueue = PriorityQueue;
});
define("KdTree", ["require", "exports", "KdNode", "PriorityQueue"], function (require, exports, KdNode_1, PriorityQueue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KdTree = void 0;
    class KdTree {
        points;
        distanceFn;
        dimensions;
        maxVariance;
        root;
        constructor(points, distanceFn, dimensions, options) {
            this.points = [...points];
            this.distanceFn = distanceFn;
            this.dimensions = dimensions;
            this.maxVariance = options?.maxVariance ?? false;
            this.root = this.maxVariance
                ? this.generateTreeByMaxVariance(this.points, null)
                : this.generateTreeByIndex(this.points, 0, null);
        }
        // If original tree was built by max-variance algorithm, this function may break that structure.
        insert(point) {
            const [parentNode, leftOrRight] = this.searchNearestLeafNode(point, this.root);
            if (parentNode === null) {
                this.root = new KdNode_1.KdNode(point, null, null, null, 0);
                return;
            }
            const newNode = new KdNode_1.KdNode(point, null, null, parentNode, (parentNode.splitIndex + 1) % this.dimensions.length);
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
        remove(point) {
            const node = this.searchNode(point, this.root);
            if (node === null)
                return;
            const data = node.data;
            const dataIndex = this.points.findIndex((p) => this.isDataEqual(p, data));
            if (dataIndex < 0)
                return;
            // maintian points array
            this.points.splice(dataIndex, 1);
            this.removeNode(node);
        }
        //
        getNearestByCount(point, count) {
            if (this.root === null || count < 1)
                return [];
            // search queue
            const queue = new PriorityQueue_1.PriorityQueue((a, b) => a.distance - b.distance);
            // nearest queue
            const neighours = new PriorityQueue_1.PriorityQueue((a, b) => b.distance - a.distance);
            //
            const getDist = (node) => {
                return this.distanceFn(point, node.data);
            };
            // main
            queue.enqueue({ node: this.root, distance: 0 });
            while (!queue.isEmpty()) {
                const nearestItem = queue.dequeue();
                if (!nearestItem)
                    continue;
                const { node } = nearestItem;
                const dist = getDist(node);
                // update nearest queue
                if (neighours.size() < count
                    || dist < (neighours.peek()?.distance ?? Infinity)) {
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
                if (otherBranch
                    && neighours.peek()
                    && (hyperDist < neighours.peek().distance)) {
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
        getNearestByDistance(point, maxDistance) {
            if (this.root === null || maxDistance < 0)
                return [];
            // search queue
            const queue = new PriorityQueue_1.PriorityQueue((a, b) => a.distance - b.distance);
            // 
            const result = [];
            //
            const getDist = (node) => {
                return this.distanceFn(point, node.data);
            };
            // main
            queue.enqueue({ node: this.root, distance: 0 });
            while (!queue.isEmpty()) {
                const nearestItem = queue.dequeue();
                if (!nearestItem)
                    continue;
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
        rebuild(options) {
            this.maxVariance = options?.maxVariance ?? false;
            this.root = this.maxVariance
                ? this.generateTreeByMaxVariance(this.points, null)
                : this.generateTreeByIndex(this.points, 0, null);
        }
        // decide split dimension on index
        generateTreeByIndex(points, depth, parent) {
            // 0
            if (points.length === 0)
                return null;
            const splitIndex = depth % this.dimensions.length;
            const dim = this.dimensions[splitIndex];
            // 1
            if (points.length === 1)
                return new KdNode_1.KdNode(points[0], null, null, parent, splitIndex);
            // > 1
            const sortedPoints = points.toSorted((a, b) => this.getValue(a, dim) - this.getValue(b, dim));
            const middeIndex = Math.floor(sortedPoints.length / 2);
            const node = new KdNode_1.KdNode(sortedPoints[middeIndex], null, null, parent, splitIndex);
            node.left = this.generateTreeByIndex(sortedPoints.slice(0, middeIndex), depth + 1, node);
            node.right = this.generateTreeByIndex(sortedPoints.slice(middeIndex + 1), depth + 1, node);
            return node;
        }
        // decide split dimension on max variance
        generateTreeByMaxVariance(points, parent) {
            // 0
            if (points.length === 0)
                return null;
            // 1
            if (points.length === 1)
                return new KdNode_1.KdNode(points[0], null, null, parent, 0);
            // > 1
            // calc average
            const total = new Array(this.dimensions.length).fill(0);
            // store values to avoid calcuate again
            const valuedPoints = [];
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
            const sortedPoints = points.toSorted((a, b) => this.getValue(a, dim) - this.getValue(b, dim));
            const middeIndex = Math.floor(sortedPoints.length / 2);
            const node = new KdNode_1.KdNode(sortedPoints[middeIndex], null, null, parent, splitIndex);
            node.left = this.generateTreeByMaxVariance(sortedPoints.slice(0, middeIndex), node);
            node.right = this.generateTreeByMaxVariance(sortedPoints.slice(middeIndex + 1), node);
            return node;
        }
        //
        getValue(point, dimension) {
            return typeof dimension === 'function'
                ? dimension(point)
                : point[dimension];
        }
        /**
         * @returns [nearestNode, leftOrRight]
         * leftOrRight: 0 -> left , 1 -> right
         */
        searchNearestLeafNode(point, node) {
            if (node === null)
                return [null, 0];
            const dim = this.dimensions[node.splitIndex];
            if (this.getValue(point, dim) < this.getValue(node.data, dim)) {
                return node.left === null ? [node, 0] : this.searchNearestLeafNode(point, node.left);
            }
            return node.right === null ? [node, 1] : this.searchNearestLeafNode(point, node.right);
        }
        // Only compare keys in dimensions.
        isDataEqual(p1, p2) {
            for (let i = 0; i < this.dimensions.length; i++) {
                const dim = this.dimensions[i];
                if (this.getValue(p1, dim) !== this.getValue(p2, dim)) {
                    return false;
                }
            }
            return true;
        }
        //
        searchNode(point, node) {
            if (node === null)
                return null;
            if (this.isDataEqual(point, node.data))
                return node;
            const dim = this.dimensions[node.splitIndex];
            if (this.getValue(point, dim) < this.getValue(node.data, dim)) {
                return this.searchNode(point, node.left);
            }
            return this.searchNode(point, node.right);
        }
        // Find the minimun kd-node of the specified dimension.
        findMinNode(node, splitIndex) {
            if (node === null)
                return null;
            if (node.splitIndex === splitIndex) {
                if (node.left === null)
                    return node;
                return this.findMinNode(node.left, splitIndex);
            }
            const dim = this.dimensions[splitIndex];
            const leftMinNode = this.findMinNode(node.left, splitIndex);
            const rightMinNode = this.findMinNode(node.right, splitIndex);
            let minNode = node;
            if (leftMinNode !== null
                && this.getValue(leftMinNode.data, dim) < this.getValue(minNode.data, dim)) {
                minNode = leftMinNode;
            }
            if (rightMinNode !== null
                && this.getValue(rightMinNode.data, dim) < this.getValue(minNode.data, dim)) {
                minNode = rightMinNode;
            }
            return minNode;
        }
        //
        removeNode(node) {
            if (node === null)
                return;
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
                const placeNode = this.findMinNode(node.right, node.splitIndex);
                node.data = placeNode.data;
                this.removeNode(placeNode);
            }
            else {
                const placeNode = this.findMinNode(node.left, node.splitIndex);
                node.data = placeNode.data;
                node.right = node.left;
                node.left = null;
                this.removeNode(placeNode);
            }
        }
    }
    exports.KdTree = KdTree;
});
define("index", ["require", "exports", "KdTree"], function (require, exports, KdTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KdTree = void 0;
    Object.defineProperty(exports, "KdTree", { enumerable: true, get: function () { return KdTree_1.KdTree; } });
});
