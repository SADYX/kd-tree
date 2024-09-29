# kd-tree

K-Dimension tree in typescript.

# Installation

```
npm install @sadyx019/kd-tree
```

# Usage

### constructor
```ts
new KdTree(
  points: T[],
  distanceFn: (a: T, b: T) => number,
  dimensions: ((keyof T) | ((p: T) => number))[],
  options?: { maxVariance?: boolean }
)
```
| Attribute Name      | Description                                                                                                                                                   |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| points              | Put your points array here                                                                                                                                    |
| distanceFn          | A function returns distance(number) between the given 2 points                                                                                                |
| dimensions          | An array includes 2 kinds of items: **point's property name(this property must be a number)** or **a function returns a number**                              |
| options.maxVariance | (OPTIONAL & DEFAULT: **false**) Set to **true** if you want kd-tree to be built with **maximum variance algorithm**,otherwise points will be splited by **dimension order**.(maxVariance can improve the tree but cost lots of time) |

Return: a KdTree instance

---

### getNearestByCount
```ts
getNearestByCount(
  point: T,
  count: number
):{ data: T; distance: number; }[]
```
| Attribute Name | Description                           |
|----------------|---------------------------------------|
| point          | \<T\>  point                             |
| count          | The number of nearest points returned |

Return: An **ordered** array includes objects consist of **point data** and **distance number**

---

### getNearestByDistance
```ts
getNearestByDistance(
  point: T,
  maxDistance: number
):{ data: T; distance: number; }[]
```
| Attribute Name | Description            |
|----------------|------------------------|
| point          | \<T\> point              |
| maxDistance    | The range of searching |

Return: An **ordered** array includes objects consist of **point data** and **distance number**

---

### rebuild
```ts
rebuild(
  options?: { maxVariance?: boolean }
): void
```
| Attribute Name      | Description         |
|---------------------|---------------------|
| options.maxVariance | (OPTIONAL & DEFAULT: **false**) Same as **constructor.options** |

---

### insert
```ts
insert(point: T): void
```
| Attribute Name | Description            |
|----------------|------------------------|
| point          | \<T\> point              |

Note: this functiom may imbalance the tree especially built with **maxVariance**

---

### remove
```ts
remove(point: T): void
```
| Attribute Name | Description            |
|----------------|------------------------|
| point          | \<T\> point              |

Note: remove **the first point** that equalFn (only compare **_dimensions_ in constructor**) returns true. This functiom may also imbalance the tree especially built with **maxVariance**

# Example

```ts
import { KdTree } from '@sadyx019/kd-tree';

interface PointType {
    x: number;
    y: number;
};

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
tree.getNearestByDistance({ x: 20, y: 20 }, 25); // get points in range 25
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
tree.rebuild();

// or rebuild with some options
/*
  tree.rebuild({ maxVariance: true })
 */

```

# Reference

https://github.com/ubilabs/kd-tree-javascript
