# kd-tree

K-Dimension Tree in typescript.

# Installation

```
npm install @sadyx019/kd-tree
```

# Usage

```ts
import { KdTree } from '@sadyx019/kd-tree'

interface PointType {
    x: number;
    y: number;
}

const points = [
    { x: 0, y: 1 },
    { x: 10, y: 21 },
    { x: 5, y: 2 },
    { x: 62, y: 2 },
    { x: 3, y: 51 },
    { x: 11, y: 1 },
    { x: 5, y: 17 },
    { x: 5500, y: 2000 },
    { x: 5500, y: 2001 }
];

const distanceFn = (a: PointType, b: PointType) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};


/*** init tree ***/
// normal way
const tree = new KdTree(
    points,
    distanceFn,
    ['x', 'y'],
);

// or more complex
/*
  const tree = new KdTree(
      points,
      distanceFn,
      ['x', 'y', (p) => p.x * 2 + p.y],
      { maxVariance: true }
  );
 */

/*** insert point ***/
tree.insert({ x: 20, y: 20 });

/*** remove point ***/
const p: PointType = {
    x: 100,
    y: 100
};

tree.remove(p);


/*** remove point ***/
tree.remove({ x: 62, y: 2 });

/*** get nearest points ***/
tree.getNearestByCount({ x: 20, y: 20 }, 3); // get 3 nearest points
/*
  console.dir
    [
      { data: { x: 20, y: 20 }, distance: 0 },
      { data: { x: 10, y: 21 }, distance: 10.04987562112089 },
      { data: { x: 5, y: 17 }, distance: 15.297058540778355 }
    ]
 */

// or get points by distance
tree.getNearestByCount({ x: 20, y: 20 }, 25); // get points in range 25
/*
  console.dir
    [
      { data: { x: 20, y: 20 }, distance: 0 },
      { data: { x: 10, y: 21 }, distance: 10.04987562112089 },
      { data: { x: 5, y: 17 }, distance: 15.297058540778355 },
      { data: { x: 11, y: 1 }, distance: 21.02379604162864 },
      { data: { x: 5, y: 2 }, distance: 23.430749027719962 }
    ]
 */

/*** rebuild tree ***/
tree.rebuild()

// or rebuild with some options
/*
  tree.rebuild({ maxVariance: true })
 */

```

# Documentation

TODO

# Reference

https://github.com/ubilabs/kd-tree-javascript
